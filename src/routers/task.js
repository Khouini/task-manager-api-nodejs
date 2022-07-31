const express = require('express');
const router = new express.Router();
const Task = require('../models/task');
const auth = require('../middleware/auth');

router.post('/tasks', auth, async (req, res) => {
  try {
    // // const task = new Task(req.body);
    const task = new Task({
      ...req.body,
      owner: req.user._id,
    });
    await task.save();
    res.status(201).send(task);
  } catch (err) {
    res.status(400).send();
  }
});

router.get('/tasks', auth, async (req, res) => {
  //! Works fine, be we want to use .populate()
  // const tasks = await Task.find({ owner: req.user._id });
  // // await req.user.populate('tasks');
  const match = {};
  const sort = {};
  if (req.query.completed) {
    match.completed = req.query.completed === 'true';
  }
  if (req.query.sortBy) {
    const parts = req.query.sortBy.split('_');
    sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
  }
  try {
    await req.user.populate({
      path: 'tasks',
      match,
      options: {
        //! Pagination
        limit: parseInt(req.query.limit),
        skip: parseInt(req.query.skip),
        //! Sorting
        sort,
      },
    });
    const tasks = req.user.tasks;
    if (!tasks) return res.status(404).send();
    res.send(tasks);
  } catch (err) {
    res.status(500).send();
  }
});

router.get('/tasks/:id', auth, async (req, res) => {
  try {
    const _id = req.params.id;
    // // const task = await Task.findById(_id);
    const task = await Task.findOne({ _id, owner: req.user._id });
    if (!task) return res.status(404).send();
    res.send(task);
  } catch (e) {
    res.status(500).send();
  }
});

router.patch('/tasks/:id', auth, async (req, res) => {
  try {
    const _id = req.params.id;
    const allowedUpdates = ['description', 'completed'];
    const updates = Object.keys(req.body);
    const isValidUpdate = updates.every(el => allowedUpdates.includes(el));
    if (!isValidUpdate) return res.status(400).send({ error: `Invalid Update` });
    //! Check patch of user to understand more
    const task = await Task.findOne({ _id, owner: req.user._id });
    if (!task) return res.status(404).send('Task does not exits');
    updates.forEach(update => (task[update] = req.body[update]));
    await task.save();
    res.send(task);
  } catch (err) {
    // console.log(err);
    res.status(500).send(err);
  }
});

router.delete('/tasks/:id', auth, async (req, res) => {
  try {
    const _id = req.params.id;
    // // const task = await Task.findByIdAndDelete(id);
    const task = await Task.findOne({ _id, owner: req.user._id });
    console.log(task);
    if (!task) return res.status(404).send();
    await task.remove();
    res.send(task);
  } catch (err) {
    res.status(500).send();
  }
});

module.exports = router;
