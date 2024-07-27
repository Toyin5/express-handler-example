const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const path = require('path');
const app = express();

// Dummy database
const users = {};

// Middlewares
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true
}));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, '../views'));

// Routes
app.get('/', (req, res) => {
  res.render('index', { user: req.session.user });
});

app.get('/signup', (req, res) => {
  res.render('signup');
});

app.post('/signup', async (req, res) => {
  const { username, password } = req.body;
  if (users[username]) {
    return res.render('signup', { error: 'User already exists' });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  users[username] = hashedPassword;
  req.session.user = username;
  res.redirect('/');
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const userPassword = users[username];
  if (!userPassword || !(await bcrypt.compare(password, userPassword))) {
    return res.render('login', { error: 'Invalid username or password' });
  }
  req.session.user = username;
  res.redirect('/');
});

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
