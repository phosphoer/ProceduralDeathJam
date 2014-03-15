TANK.registerComponent("Player")

.interfaces("Drawable")

.requires("Pos2D, Velocity, Collider")

.construct(function()
{
  this.zdepth = 3;

  this.turnAccel = 5;
  this.accel = 100;
  this.health = 5;

  this.up = false;
  this.right = false;
  this.down = false;
  this.left = false;

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
    TANK.addEntity(e);
  };

  this.OnCollide = function(other)
  {
    if (other.Bullet)
    {
      --this.health;
      TANK.removeEntity(other);
      this.parent.Velocity.x += other.Velocity.x * 0.2;
      this.parent.Velocity.y += other.Velocity.y * 0.2;
      this.updateStatus();
    }

    if (other.HealthPickup)
    {
      if (this.health < 5)
        this.health += other.HealthPickup.value;
      TANK.removeEntity(other);
      this.updateStatus();
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
  });

  this.draw = function(ctx, camera)
  {
    ctx.save();

    ctx.translate(this.parent.Pos2D.x - camera.x, this.parent.Pos2D.y - camera.y);
    ctx.rotate(this.parent.Pos2D.rotation);
    ctx.scale(TANK.World.scaleFactor, TANK.World.scaleFactor);
    ctx.translate(-4, -4);

    ctx.drawImage(this.canvas, 0, 0);

    if (this.up)
    {
      ctx.fillStyle = "#f55";
      ctx.beginPath();
      ctx.moveTo(0, 5);
      ctx.lineTo(-5, 3);
      ctx.lineTo(0, 1);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  };
})

.destruct(function()
{
  this.healthUI.remove();
});