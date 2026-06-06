package server

import (
	"net/http"
	"sync"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

// wsHub manages WebSocket connections per lead room.
// When a new message arrives via HTTP POST, it is broadcast
// to all connected clients watching that lead.
type wsHub struct {
	mu    sync.RWMutex
	rooms map[string]map[*wsConn]struct{}
}

type wsConn struct {
	conn *websocket.Conn
}

var hub = &wsHub{
	rooms: make(map[string]map[*wsConn]struct{}),
}

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		origin := r.Header.Get("Origin")
		if origin == "" {
			return true
		}
		return isAllowedOrigin(origin, []string{})
	},
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}

// join adds a connection to a lead room.
func (h *wsHub) join(leadID string, c *wsConn) {
	h.mu.Lock()
	defer h.mu.Unlock()
	if h.rooms[leadID] == nil {
		h.rooms[leadID] = make(map[*wsConn]struct{})
	}
	h.rooms[leadID][c] = struct{}{}
}

// leave removes a connection from a lead room.
func (h *wsHub) leave(leadID string, c *wsConn) {
	h.mu.Lock()
	defer h.mu.Unlock()
	delete(h.rooms[leadID], c)
	if len(h.rooms[leadID]) == 0 {
		delete(h.rooms, leadID)
	}
}

// broadcast sends a JSON payload to all clients in a lead room.
func (h *wsHub) broadcast(leadID string, payload interface{}) {
	h.mu.RLock()
	conns := make([]*wsConn, 0, len(h.rooms[leadID]))
	for c := range h.rooms[leadID] {
		conns = append(conns, c)
	}
	h.mu.RUnlock()

	for _, c := range conns {
		if err := c.conn.WriteJSON(payload); err != nil {
			c.conn.Close()
			h.leave(leadID, c)
		}
	}
}

// wsHandler upgrades the HTTP connection to WebSocket and
// listens until the client disconnects (read pump for ping/pong).
func (h Handler) wsLeadChat(c *gin.Context) {
	leadID := c.Param("id")

	ws, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		return
	}

	conn := &wsConn{conn: ws}
	hub.join(leadID, conn)
	defer func() {
		hub.leave(leadID, conn)
		ws.Close()
	}()

	// Keep the connection alive — read loop discards incoming frames.
	for {
		if _, _, err := ws.ReadMessage(); err != nil {
			break
		}
	}
}
