TANK.registerComponent("Player")

.interfaces("Drawable")

.requires("Pos2D, Velocity, Collider")

.construct(function()
{
  this.zdepth = 3;

  this.turnAccel = 5;
  this.accel = 100;
  this.health = 5;
  this.weapon = 0;
  this.orbsCollected = 0;
  this.kills = 0;

  this.up = false;
  this.right = false;
  this.down = false;
  this.left = false;

  this.path = [];
  this.pathTimer = 0;
  this.pathScore = 0;

  this.canvas = document.createElement("canvas");
  this.canvas.width = 8;
  this.canvas.height = 8;
  this.context = this.canvas.getContext("2d");

  this.colCanvas = document.createElement("canvas");
  this.colCanvas.width = 16;
  this.colCanvas.height = 16;
  this.colContext = this.colCanvas.getContext("2d");
})

.initialize(function()
{
  this.context.fillStyle = "#fff";
  this.context.fillRect(0, 3, 8, 2);
  this.context.fillRect(0, 1, 2, 2);

  this.parent.Collider.collisionLayer = "Player";
  this.parent.Collider.collidesWith = ["Bullets", "Pickups"];
  this.parent.Collider.width = this.canvas.width * TANK.World.scaleFactor;
  this.parent.Collider.height = this.canvas.height * TANK.World.scaleFactor;

  this.healthUI = $("<div></div>");
  this.healthUI.addClass("health-indicator");
  this.healthUI.appendTo(TANK.Game.barUI);
  this.healthUILabel = $("<span class='health-indicator-label'>Ship Status - </span>");
  this.healthUILabel.appendTo(this.healthUI);
  this.healthUIValue = $("<span class='health-indicator-value'></span>");
  this.healthUIValue.appendTo(this.healthUI);

  this.scoreUI = $("<div></div>");
  this.scoreUI.addClass("score-indicator");
  this.scoreUI.appendTo(TANK.Game.barUI);
  this.scoreUILabel = $("<span class='score-indicator-label'>Distance - </span>");
  this.scoreUILabel.appendTo(this.scoreUI);
  this.scoreUIValue = $("<span class='score-indicator-value'></span>");
  this.scoreUIValue.appendTo(this.scoreUI);

  this.collectedUI = $("<div></div>");
  this.collectedUI.addClass("collected-indicator");
  this.collectedUI.appendTo(TANK.Game.barUI);
  this.collectedUILabel = $("<span class='collected-indicator-label'>Orbs - </span>");
  this.collectedUILabel.appendTo(this.collectedUI);
  this.collectedUIValue = $("<span class='collected-indicator-value'>0</span>");
  this.collectedUIValue.appendTo(this.collectedUI);

  this.killsUI = $("<div></div>");
  this.killsUI.addClass("kills-indicator");
  this.killsUI.appendTo(TANK.Game.barUI);
  this.killsUILabel = $("<span class='kills-indicator-label'>Kills - </span>");
  this.killsUILabel.appendTo(this.killsUI);
  this.killsUIValue = $("<span class='kills-indicator-value'>0</span>");
  this.killsUIValue.appendTo(this.killsUI);

  var t = this.parent.Pos2D;

  this.updateStatus = function()
  {
    this.healthUIValue.removeClass(this.status);
    if (this.health > 4)
      this.status = "good";
    else if (this.health > 2)
      this.status = "damaged"
    else
      this.status = "critical";
    this.healthUIValue.text(this.status);
    this.healthUIValue.addClass(this.status);
  };
  this.updateStatus();

  this.shoot = function()
  {
    var e = TANK.createEntity("Bullet");
    e.Pos2D.x = this.parent.Pos2D.x + Math.cos(this.parent.Pos2D.rotation) * 8 * 5;
    e.Pos2D.y = this.parent.Pos2D.y + Math.sin(this.parent.Pos2D.rotation) * 8 * 5;
    e.Velocity.x = Math.cos(this.parent.Pos2D.rotation) * 500;
    e.Velocity.y = Math.sin(this.parent.Pos2D.rotation) * 500;
    e.Bullet.owner = this.parent;
    TANK.addEntity(e);
    lowLag.play("res/shoot.wav");
  };

  this.OnCollide = function(other)
  {
    if (other.Bullet || other.Spike)
    {
      --this.health;
      TANK.removeEntity(other);
      this.parent.Velocity.x += other.Velocity.x * 0.15;
      this.parent.Velocity.y += other.Velocity.y * 0.15;
      this.updateStatus();
      lowLag.play("res/hit.wav");
    }

    if (other.Powerup)
    {
      if (this.health < 5)
        ++this.health;

      this.updateStatus();
      TANK.removeEntity(other);
      this.weapon = other.Powerup.weapon;
      ++this.orbsCollected;
      this.collectedUIValue.text(this.orbsCollected);
      lowLag.play("res/powerup.wav");
    }
  };

  this.addEventListener("OnKeyPress", function(keycode)
  {
    if (keycode === TANK.Key.W)
      this.up = true;
    if (keycode === TANK.Key.S)
      this.down = true;
    if (keycode === TANK.Key.D)
      this.right = true;
    if (keycode === TANK.Key.A)
      this.left = true;
    if (keycode === TANK.Key.SPACE)
      this.shoot();
  });

  this.addEventListener("OnKeyRelease", function(keycode)
  {
    if (keycode === TANK.Key.W)
      this.up = false;
    if (keycode === TANK.Key.S)
      this.down = false;
    if (keycode === TANK.Key.D)
      this.right = false;
    if (keycode === TANK.Key.A)
      this.left = false;
  });

  this.addEventListener("OnEnterFrame", function(dt)
  {
    this.colContext.save();
    this.colContext.clearRect(0, 0, 16, 16);
    this.colContext.translate(4, 4);
    this.colContext.rotate(this.parent.Pos2D.rotation);
    this.colContext.translate(-4, -4);
    this.colContext.drawImage(this.canvas, 0, 0);
    this.colContext.restore();
    var buffer = this.colContext.getImageData(0, 0, 16, 16);

    if (TANK.World.testCollision(buffer, this.parent.Pos2D.x - 4 * TANK.World.scaleFactor, this.parent.Pos2D.y - 4 * TANK.World.scaleFactor))
    {
      lowLag.play("res/hit2.wav");
      this.health -= 1;
      this.updateStatus();

      t.x = this.oldPos[0];
      t.y = this.oldPos[1];
      if (Math.abs(this.parent.Velocity.x) > Math.abs(this.parent.Velocity.y))
        this.parent.Velocity.x *= -0.5;
      else
        this.parent.Velocity.y *= -0.5;

      this.parent.Velocity.r += Math.random() * 10 - 5;
    }
    this.oldPos = [t.x, t.y];

    // Die if dead
    if (this.health <= 0)
      this.dead = true;

    if (this.dead === true)
    {
      lowLag.play("res/explode2.wav");
      var save = JSON.parse(localStorage["pdj-phosphoer-save"]);
      if (save.collected < this.orbsCollected)
        save.collected = this.orbsCollected;
      if (save.distance < this.pathScore)
        save.distance = this.pathScore;
      if (save.kills < this.kills)
        save.kills = this.kills;
      localStorage["pdj-phosphoer-save"] = JSON.stringify(save);

      TANK.Game.recordUIValueA.text(save.distance + "m");
      TANK.Game.recordUIValueB.text(save.collected);
      TANK.Game.recordUIValueC.text(save.kills);

      TANK.removeEntity(this.parent);
      TANK.Game.restart();

      for (var i = 0; i < 50; ++i)
      {
        var e = TANK.createEntity("Particle");
        e.Pos2D.x = t.x;
        e.Pos2D.y = t.y;
        e.Particle.angle = Math.random() * Math.PI * 2;
        e.Particle.life = 2 + Math.random();
        e.Particle.speed = 200 + Math.random() * 200;
        e.Particle.friction = 0.92 + Math.random() * 0.02;
        if (Math.random() < 0.5)
          e.Particle.color = "#333";
        var size = Math.random() * 3;
        e.Particle.size = [size, size];
        TANK.addEntity(e);
      }
    }

    if (this.status === "critical")
    {
      for (var i = 0; i < 1; ++i)
      {
        var e = TANK.createEntity("Particle");
        e.Pos2D.x = t.x;
        e.Pos2D.y = t.y;
        e.Particle.angle = Math.random() * Math.PI * 2;
        e.Particle.life = 2 + Math.random();
        e.Particle.speed = 20 + Math.random() * 20;
        e.Particle.friction = 0.96 + Math.random() * 0.02;
        if (Math.random() < 0.5)
          e.Particle.color = "#333";
        var size = Math.random() * 3;
        e.Particle.size = [size, size];
        TANK.addEntity(e);
      }
    }

    if (this.up)
    {
      this.parent.Velocity.x += Math.cos(this.parent.Pos2D.rotation) * dt * this.accel;
      this.parent.Velocity.y += Math.sin(this.parent.Pos2D.rotation) * dt * this.accel;
    }
    if (this.down)
    {
      this.parent.Velocity.x -= Math.cos(this.parent.Pos2D.rotation) * dt * this.accel * 0.5;
      this.parent.Velocity.y -= Math.sin(this.parent.Pos2D.rotation) * dt * this.accel * 0.5;
    }
    if (this.right)
    {
      this.parent.Velocity.r += dt * this.turnAccel;
    }
    if (this.left)
    {
      this.parent.Velocity.r -= dt * this.turnAccel;
    }

    // Position camera
    TANK.RenderManager.camera.x = this.parent.Pos2D.x - window.innerWidth / 2;
    TANK.RenderManager.camera.y = this.parent.Pos2D.y - window.innerHeight / 2;

    // Place path markers
    this.pathTimer += dt;
    if (this.pathTimer > 1)
    {
      this.pathTimer = 0;
      var point = {x: t.x, y: t.y};
      if (this.status === "good")
        point.strokeStyle = "rgba(100, 255, 100, 0.4)";
      else if (this.status === "damaged")
        point.strokeStyle = "rgba(255, 255, 100, 0.4)";
      else if (this.status === "critical")
        point.strokeStyle = "rgba(255, 100, 100, 0.4)";
      this.path.push(point);
    }

    // Calculate path score
    var dist = 0;
    for (var i = 1; i < this.path.length; ++i)
    {
      var p1 = this.path[i];
      var p2 = this.path[i - 1];
      dist += Math.sqrt((p1.x - p2.x) * (p1.x - p2.x) + (p1.y - p2.y) * (p1.y - p2.y));
    }
    this.pathScore = Math.round(dist / 10);
    this.scoreUIValue.text(this.pathScore + "m");
  });

  this.draw = function(ctx, camera)
  {
    // Draw path
    ctx.save();
    ctx.strokeStyle = "rgba(100, 255, 100, 0.4)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    if (this.path[0])
      ctx.moveTo(this.path[0].x - camera.x, this.path[0].y - camera.y);
    for (var i = 1; i < this.path.length; ++i)
    {
      ctx.lineTo(this.path[i].x - camera.x, this.path[i].y - camera.y);
      if (this.path[i].strokeStyle != ctx.strokeStyle)
      {
        ctx.stroke();
        ctx.closePath();
        ctx.beginPath();
        ctx.moveTo(this.path[i].x - camera.x, this.path[i].y - camera.y);
        ctx.strokeStyle = this.path[i].strokeStyle;
      }
    }
    ctx.lineTo(t.x - camera.x, t.y - camera.y);
    ctx.stroke();
    ctx.restore();

    // Draw ship
    ctx.save();
    ctx.translate(this.parent.Pos2D.x - camera.x, this.parent.Pos2D.y - camera.y);
    ctx.rotate(this.parent.Pos2D.rotation);
    ctx.scale(TANK.World.scaleFactor, TANK.World.scaleFactor);
    ctx.translate(-4, -4);
    ctx.drawImage(this.canvas, 0, 0);

    // Draw engines
    ctx.fillStyle = "#f55";
    if (this.up)
    {
      ctx.beginPath();
      ctx.moveTo(0, 5);
      ctx.lineTo(-5, 3);
      ctx.lineTo(0, 1);
      ctx.closePath();
      ctx.fill();
    }
    if (this.down)
    {
      ctx.beginPath();
      ctx.moveTo(8, 3);
      ctx.lineTo(10, 4);
      ctx.lineTo(8, 5);
      ctx.closePath();
      ctx.fill();
    }
    if (this.left)
    {
      ctx.beginPath();
      ctx.moveTo(6, 5);
      ctx.lineTo(7, 7);
      ctx.lineTo(8, 5);
      ctx.closePath();
      ctx.fill();
    }
    if (this.right)
    {
      ctx.beginPath();
      ctx.moveTo(6, 3);
      ctx.lineTo(7, 1);
      ctx.lineTo(8, 3);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  };
})

.destruct(function()
{
  this.healthUI.remove();
  this.scoreUI.remove();
  this.collectedUI.remove();
  this.killsUI.remove();
});