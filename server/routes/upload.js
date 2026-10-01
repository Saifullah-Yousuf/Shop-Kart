const router = require('express').Router();
const multer = require('multer');
const Image = require('../models/Image');
const { protect, admin } = require('../middleware/auth');
const ah = require('../utils/asyncHandler');

// Keep the file in memory, then save it to MongoDB
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) =>
    /^image\/(jpeg|png|webp|gif)$/.test(file.mimetype) ? cb(null, true) : cb(new Error('Only JPG, PNG, WEBP or GIF images')),
});

router.post('/', protect, admin, upload.single('image'), ah(async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No image received' });
  const img = await Image.create({ data: req.file.buffer, contentType: req.file.mimetype, size: req.file.size });
  res.status(201).json({ url: `/api/images/${img._id}` });
}));

module.exports = router;
