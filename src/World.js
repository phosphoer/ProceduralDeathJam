TANK.registerComponent("World")

.interfaces("Drawable")

.construct(function()
{
  this.zdepth = 0;

  this.tileSize = 64;
  this.scaleFactor = 5;
  this.rooms = [];
  this.enemies = [];

  this.tiles = {};
})

.initialize(function()
{
  this.addEventListener("OnEnterFrame", function(dt)
  {
    var camera = TANK.RenderManager.camera;
    var cameraSize = [window.innerWidth * 1.2, window.innerHeight * 1.2];

    // Check if camera is near an enemy spawn point and place the enemy
    for (var i = 0; i < this.enemies.length; ++i)
    {
      var spawn = this.enemies[i];
      if (spawn.e)
        continue;


      if (Math.pointInAABB([spawn.x, spawn.y], [camera.x + cameraSize[0] / 2, camera.y + cameraSize[1] / 2], cameraSize))
      {
        var e = TANK.createEntity("Enemy");
        e.Pos2D.x = spawn.x;
        e.Pos2D.y = spawn.y;
        TANK.addEntity(e);
        spawn.e = e;
      }
    }

    // Also show canvas's where the camera is
    for (var x = camera.x / this.scaleFactor; x <= (camera.x + cameraSize[0] * 1.3) / this.scaleFactor; x += this.tileSize)
    {
      for (var y = camera.y / this.scaleFactor; y <= (camera.y + cameraSize[1] * 1.3) / this.scaleFactor; y += this.tileSize)
      {
        this.getTileOrMake(Math.floor(x / this.tileSize), Math.floor(y / this.tileSize));
      }
    }
  });

  this.testCollisionAtPixel = function(x, y)
  {
    x = Math.round(x);
    y = Math.round(y);

    var cellX = Math.floor(x / this.tileSize);
    var cellY = Math.floor(y / this.tileSize);
    var pixelX = x - cellX * this.tileSize;
    var pixelY = y - cellY * this.tileSize;
    var tile = this.getTileOrMake(cellX, cellY);

    var pixel = this.getPixel(tile.buffer, pixelX, pixelY);
    return pixel.a > 0;
  };

  this.testCollisionAtPoint = function(x, y)
  {
    x = Math.round(x / this.scaleFactor);
    y = Math.round(y / this.scaleFactor);
    return this.testCollisionAtPixel(x, y);
  };

  this.testCollision = function(buffer, x, y)
  {
    x = Math.round(x / this.scaleFactor);
    y = Math.round(y / this.scaleFactor);

    for (var i = 0; i < buffer.width; ++i)
    {
      for (var j = 0; j < buffer.height; ++j)
      {
        var p = this.getPixel(buffer, i, j);
        if (p.a > 0)
        {
          if (this.testCollisionAtPixel(x + i, y + j))
            return true;
        }
      }
    }

    return false;
  };

  this.getTile = function(x, y)
  {
    if (this.tiles[x] && this.tiles[x][y])
      return this.tiles[x][y];
    return null;
  };

  this.getTileOrMake = function(x, y)
  {
    var tile = this.getTile(x, y);
    if (!tile)
    {
      tile = {};
      tile.canvas = document.createElement("canvas");
      tile.canvas.width = this.tileSize;
      tile.canvas.height = this.tileSize;
      tile.context = tile.canvas.getContext("2d");
      tile.context.fillStyle = "#444";
      tile.context.fillRect(0, 0, this.tileSize, this.tileSize);
      tile.buffer = tile.context.getImageData(0, 0, this.tileSize, this.tileSize);
      this.setTile(x, y, tile);
    }

    return tile;
  }

  this.setTile = function(x, y, value)
  {
    if (!this.tiles[x])
      this.tiles[x] = {};
    this.tiles[x][y] = value;
  };

  this.setPixel = function(buffer, x, y, r, g, b, a)
  {
    var index = x * 4 + (y * buffer.width * 4);
    buffer.data[index + 0] = r;
    buffer.data[index + 1] = g;
    buffer.data[index + 2] = b;
    buffer.data[index + 3] = a;
  };

  this.getPixel = function(buffer, x, y)
  {
    var index = x * 4 + (y * buffer.width * 4);
    var pixel = {};
    pixel.r = buffer.data[index + 0];
    pixel.g = buffer.data[index + 1];
    pixel.b = buffer.data[index + 2];
    pixel.a = buffer.data[index + 3];
    return pixel;
  };

  this.makeHole = function(x, y, radius)
  {
    x = Math.floor(x);
    y = Math.floor(y);
    radius = Math.floor(radius);

    var tiles = [];

    for (var i = x - radius; i < x + radius; ++i)
    {
      for (var j = y - radius; j < y + radius; ++j)
      {
        var cellX = Math.floor(i / this.tileSize);
        var cellY = Math.floor(j / this.tileSize);
        var pixelX = i - cellX * this.tileSize;
        var pixelY = j - cellY * this.tileSize;
        var tile = this.getTileOrMake(cellX, cellY);

        var found = false;
        for (var n = 0; n < tiles.length; ++n)
        {
          if (tiles[n] === tile)
          {
            found = true;
            break;
          }
        }
        if (!found)
          tiles.push(tile);

        var dist = Math.sqrt((i - x) * (i - x) + (j - y) * (j - y));
        if (dist < radius)
          this.setPixel(tile.buffer, pixelX, pixelY, 0, 0, 0, 0);
      }
    }

    for (var n = 0; n < tiles.length; ++n)
      tiles[n].context.putImageData(tiles[n].buffer, 0, 0);
  };

  this.makeTunnel = function(startX, startY, minRadius, maxRadius, dir, length, forks)
  {
    if (length <= 1)
      return;
    if (maxRadius <= 2)
      return;

    var wormX = startX;
    var wormY = startY;
    var wormAngle = dir;
    var radius = minRadius + Math.random() * (maxRadius - minRadius);
    var nextFork = length / forks;

    for (var i = 0; i < length; ++i)
    {
      this.makeHole(wormX, wormY, radius);
      wormX += Math.cos(wormAngle) * radius / 2;
      wormY += Math.sin(wormAngle) * radius / 2;

      wormAngle += (Math.random() - 0.5) * 0.5;
      if (wormAngle < dir - Math.PI / 2)
        wormAngle = dir - Math.PI / 2;
      if (wormAngle > dir + Math.PI / 2)
        wormAngle = dir + Math.PI / 2;
      radius += (Math.random() - 0.5) * 2;
      if (radius > maxRadius)
        radius = maxRadius;
      if (radius < minRadius)
        radius = minRadius;

      if (i >= nextFork)
      {
        nextFork += length / forks;
        var newDir = wormAngle + Math.PI / 4 + Math.random() * Math.PI / 4;
        if (Math.random() < 0.5)
          newDir -= Math.PI / 2;
        this.makeTunnel(wormX, wormY, minRadius * 0.9, maxRadius * 0.9, newDir, length * 0.8, forks * 0.6);
      }

      if (Math.random() < 0.05)
      {
        if (Math.sqrt(wormX * wormX + wormY * wormY) > 50 * this.scaleFactor)
          this.enemies.push({x: wormX * this.scaleFactor, y: wormY * this.scaleFactor});
      }
    }

    this.addRoom(wormX, wormY, maxRadius * 2);
  };

  this.addRoom = function(x, y, radius)
  {
    var room = {};
    room.x = x;
    room.y = y;
    room.radius = radius;

    // Cancel if any nearby rooms
    for (var i = 0; i < this.rooms.length; ++i)
    {
      var r = this.rooms[i];
      var dist = Math.sqrt((x - r.x) * (x - r.x) + (y - r.y) * (y - r.y));
      if (dist < r.radius + radius + 5)
      {
        return;
      }
    }

    this.makeHole(x, y, radius);

    var e = TANK.createEntity("Powerup");
    e.Pos2D.x = x * this.scaleFactor;
    e.Pos2D.y = y * this.scaleFactor;
    TANK.addEntity(e);
    room.powerup = e;

    this.rooms.push(room);
  };

  this.makeTunnel(0, 0, 20, 30, Math.PI / 2, 150, 6);

  this.draw = function(ctx, camera, dt)
  {
    ctx.save();
    ctx.translate(-camera.x, -camera.y);
    ctx.scale(this.scaleFactor, this.scaleFactor);

    for (var i in this.tiles)
    {
      for (var j in this.tiles[i])
      {
        var tile = this.tiles[i][j];
        ctx.drawImage(tile.canvas, parseInt(i) * this.tileSize, parseInt(j) * this.tileSize);
      }
    }

    ctx.restore();
  };
})

.destruct(function()
{
  for (var i = 0; i < this.enemies.length; ++i)
  {
    if (this.enemies[i].e && this.enemies[i].e.initialized)
      TANK.removeEntity(this.enemies[i].e);
  }

  for (var i = 0; i < this.rooms.length; ++i)
  {
    if (this.rooms[i].powerup.initialized)
      TANK.removeEntity(this.rooms[i].powerup);
  }
});