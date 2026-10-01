const router = require('express').Router();
const Settings = require('../models/Settings');
const { protect, admin } = require('../middleware/auth');
const ah = require('../utils/asyncHandler');

router.get('/', ah(async (req, res) => res.json(await Settings.getSingleton())));

router.put('/', protect, admin, ah(async (req, res) => {
  const s = await Settings.getSingleton();
  const { _id, createdAt, updatedAt, __v, ...changes } = req.body;
  s.set(changes);
  await s.save();
  res.json(s);
}));

module.exports = router;
