require('dotenv').config();

const express = require('express');
const app = express();
const port = process.env.PORT;
require('./db/mongoose');
const userRouter = require('./routers/user');
const taskRouter = require('./routers/task');
//! Automaticlyy parse the incoming data (json) to Object [For POST per example]
app.use(express.json());
//! Express MiddleWare
//* Maintenance example with Middleware
/*app.use((req, res, next) => {
  res.status(503).send('The sever is under maintenance');
});*/
//! Routers
app.use(userRouter);
app.use(taskRouter);

app.get('/', (req, res) => res.send('Hello World!'));
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
/////////////////////////////////////////////////////////////////////////////////
//! Foreign keys (playground)
/*const Task = require('./models/task');
const User = require('./models/user');
async function main() {
  //! Task =====> User
  const task = await Task.findById('62e270ff41f6fff225314dfc');
  await task.populate('owner');
  console.log(task.owner);
  //! The reverse: User ====> Tasks
  const user = await User.findById('62e26eb0edb4a4462dde0a09');
  await user.populate('tasks');
  console.log(user.tasks);
}
main();
*/

//! Uploading Files
/*const multer = require('multer');
const upload = multer({
  dest: 'images',
  limits: {
    fileSize: 1000000,
  },
   fileFilter(req, file, cb) {
    // if (!file.originalname.endsWith('.pdf')) {
    if (!file.originalname.match(/\.(doc|docx)$/)) {
      return cb(new Error('File must be a PDF'));
    }
    cb(undefined, true);

    // cb(new Error('File must be a PDF'));
    // cb(undefined, true); // accept upload
    // cb(undefined, false); //Reject upload
},
});
//* Upload.single(key of form-data)
app.post('/upload', upload.single('upload'), function (req, res) {
  res.send('POST request to the homepage');
});*/

//! Handling middleware Errors
/*function middlewareError(req, res, next) {
  throw new Error('Error from my middleware');
}
app.post(
  '/upload',
  middlewareError,
  function (req, res) {
    res.send('POST request to the homepage');
  },
  (error, req, res, next) => {
    res.status(400).send({ error: error.message });
  }
);
*/
