const router = require('express').Router();
const Image = require('../models/Image');
const ah = require('../utils/asyncHandler');

router.get('/:id', ah(async (req, res) => {
  const img = await Image.findById(req.params.id);
  if (!img) return res.status(404).json({ message: 'Image not found' });
  res.set('Content-Type', img.contentType);
  res.set('Cache-Control', 'public, max-age=31536000, immutable'); // image never changes for the same id
  res.send(img.data);
}));

module.exports = router;
