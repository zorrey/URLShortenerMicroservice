
require('dotenv').config();
const express = require('express');
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const cors = require('cors');
const dns = require('dns');
const urlparser = require('url');
const app = express();
//let count;
//const route = express.Router();

// Basic Configuration

const port = process.env.PORT || 3000;
mongoose.connect(process.env.DB_URI);
console.log('mongoose.connection.readyState---', mongoose.connection.readyState);
const db = mongoose.connection;
db.on('error', error => console.error(error));
db.once('open', () => console.log('db connected'));

const { Schema } = mongoose;

const urlSchema = new Schema({
  url: { type: String },
  origin: String,
  short: String
});

const urlShort = mongoose.model('urlShort', urlSchema);
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));

app.use(cors());

//app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint

app.post('/api/shorturl', (req, res) => {
  // console.log(req.body);
  const bodyurl = req.body.url;
  const dnsEngine = dns.lookup(urlparser.parse(bodyurl).hostname, async (err, address) => {
    if (!address) {
      res.json({ error: 'invalid url' });
      return console.error(err);
    } else {
      const newurl = new urlShort({
        url: bodyurl,
        origin: dnsEngine.hostname
      });
      try {
        const urlData = await newurl.save();
        res.json({
          original_url: urlData.url,
          short_url: urlData.id
        })

      } catch (err) {
        res.json({ error: 'invalid url' })
        return console.error(err);
      }
    }
    //console.log("dns", err);
    //console.log("address", address);     
  })
  //console.log("dnsEngine", dnsEngine);
});

app.get('/api/shorturl/:id', async (req, res) => {
  const id = req.params.id;
  console.log(id);
  try{
   const data = await urlShort.findById(id).exec()
    res.redirect(data.url)
  }catch(err){
    if (!data) {
      res.json({ error: 'invalid url' })
     
    } else{
      return console.error(err);
    }
  }
})

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});

