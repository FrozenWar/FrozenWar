// Server init point

import express from 'express';

let app = express();

app.listen(8000, () => {
  console.log('server started');
});
