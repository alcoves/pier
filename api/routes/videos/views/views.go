package views

import (
	"fmt"
	"time"

	"github.com/bken-io/api/api/db"
	"github.com/bken-io/api/api/models"
	"github.com/gofiber/fiber/v2"
)

// CreateView registers a video view
func CreateView(c *fiber.Ctx) error {
	id := c.Params("id")

	requestingIPHeader := c.Get("cf-connecting-ip")
	if requestingIPHeader == "" {
		return c.Status(400).SendString("Unable to parse CF-Connecting-IP header")
	}

	db := db.DBConn
	var video models.Video
	db.Where("id = ?", id).Find(&video)

	currentTime := time.Now()
	backdate := time.Duration(-video.Duration * 1000 * 1000 * 1000)
	fmt.Println("backdate", backdate)
	timeOffset := currentTime.Add(backdate)

	var recentView models.VideoView
	db.
		Where("video = ?", video.ID).
		Where("ip = ?", requestingIPHeader).
		Where("created_at >= ?", timeOffset).
		Find(&recentView)

	if recentView.IP != "" {
		return c.SendString("video was recently viewed")
	}

	view := models.VideoView{
		IP:    requestingIPHeader,
		Video: id,
	}
	db.Create(&view)
	return c.SendString("video view counted")
}
