TANK.registerComponent("Enemy")

.interfaces("Drawable")

.requires("Pos2D, Velocity, Collider")

.construct(function()
{
  this.zdepth = 2;

  this.dead = false;
  this.health = 6;

  this.flash = true;

  this.avoidUp = false;
  this.avoidRight = false;
  this.avoidDown = false;
  this.avoidLeft = false;

  this.up = false;
  this.right = false;
  this.down = false;
  this.left = false;

  this.canvas = document.createElement("canvas");
  this.canvas.width = 8;
  this.canvas.height = 8;
  this.context = this.canvas.getContext("2d");
})

.initialize(function()
{
  var scaleFactor = TANK.World.scaleFactor;
  var t = this.parent.Pos2D;

  this.parent.Collider.collisionLayer = "Enemies";
  this.parent.Collider.collidesWith = ["Bullets"];
  this.parent.Collider.width = this.canvas.width * scaleFactor;
  this.parent.Collider.height = this.canvas.height * scaleFactor;

  this.addEventListener("OnEnterFrame", function(dt)
  {
    // Check if dead
    if (this.health <= 0)
      this.dead = true;

    // Test collision against world
    if (TANK.World.testCollision(this.buffer, t.x - (this.canvas.width / 2) * scaleFactor, t.y - (this.canvas.height / 2) * scaleFactor))
    {
      this.dead = true;
    }

    // If we are dead then explode
    if (this.dead)
    {
      TANK.removeEntity(this.parent);

      for (var i = 0; i < 15; ++i)
      {
        var e = TANK.createEntity("Part");
        e.Pos2D.x = t.x - 10 + Math.random() * 20;
        e.Pos2D.y = t.y - 10 + Math.random() * 20;
        TANK.addEntity(e);
      }

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

    // Check for walls in the cardinal directions in an attempt to not hit walls
    if (TANK.World.testCollisionAtPoint(t.x, t.y - 15 * scaleFactor))
      this.avoidUp = true;
    else
      this.avoidUp = false;
    if (TANK.World.testCollisionAtPoint(t.x, t.y + 15 * scaleFactor))
      this.avoidDown = true;
    else
      this.avoidDown = false;
    if (TANK.World.testCollisionAtPoint(t.x - 15 * scaleFactor, t.y))
      this.avoidLeft = true;
    else
      this.avoidLeft = false;
    if (TANK.World.testCollisionAtPoint(t.x + 15 * scaleFactor, t.y))
      this.avoidRight = true;
    else
      this.avoidRight = false;

    // Use avoid flags to correct position
    if (this.avoidUp)
      this.parent.Velocity.y += dt * 90;
    if (this.avoidDown)
      this.parent.Velocity.y -= dt * 90;
    if (this.avoidRight)
      this.parent.Velocity.x -= dt * 90;
    if (this.avoidLeft)
      this.parent.Velocity.x += dt * 90;

    // Cancel moving in a particlar direction if avoiding
    if (this.avoidUp)
      this.up = false;
    if (this.avoidRight)
      this.right = false;
    if (this.avoidDown)
      this.down = false;
    if (this.avoidLeft)
      this.left = false;

    // Limit max speed
    var v = this.parent.Velocity;
    if (Math.sqrt(v.x * v.x + v.y * v.y) > 25 && !this.dead)
    {
      v.x *= 0.97;
      v.y *= 0.97;
    }

    // Choose a direction to move in
    if (Math.random() < 0.005 && !this.avoidUp)
      this.up = true;
    if (Math.random() < 0.005 && !this.avoidRight)
      this.right = true;
    if (Math.random() < 0.005 && !this.avoidDown)
      this.down = true;
    if (Math.random() < 0.005 && !this.avoidLeft)
      this.left = true;

    if (Math.random() < 0.005)
      this.up = false;
    if (Math.random() < 0.005)
      this.right = false;
    if (Math.random() < 0.005)
      this.down = false;
    if (Math.random() < 0.005)
      this.left = false;

    // Move
    if (this.up)
      this.parent.Velocity.y -= dt * 80;
    if (this.down)
      this.parent.Velocity.y += dt * 80;
    if (this.right)
      this.parent.Velocity.x += dt * 80;
    if (this.left)
      this.parent.Velocity.x -= dt * 80;

    // Shoot at player randomly
    var player = TANK.getEntity("Player");
    if (player && Math.random() < 0.002)
    {
      var angle = Math.atan2(player.Pos2D.y - t.y, player.Pos2D.x - t.x);
      angle += -0.2 + Math.random() * 0.2
      var b = TANK.createEntity("Bullet");
      b.Pos2D.x = t.x + Math.cos(angle) * 50;
      b.Pos2D.y = t.y + Math.sin(angle) * 50;
      b.Velocity.x = Math.cos(angle) * 300;
      b.Velocity.y = Math.sin(angle) * 300;
      TANK.addEntity(b);
    }
  });

  this.OnCollide = function(other)
  {
    if (other.Bullet)
    {
      TANK.removeEntity(other);
      --this.health;
      this.flash = true;
      this.parent.Velocity.x += other.Velocity.x * 0.3;
      this.parent.Velocity.y += other.Velocity.y * 0.3;
    }
  };

  this.drawInternal = function()
  {
    if (this.flash)
      this.context.fillStyle = "#fff";
    else
      this.context.fillStyle = "#f55";

    this.context.fillRect(0, 0, 8, 8);
    this.buffer = this.context.getImageData(0, 0, 8, 8);
  };

  this.drawInternal();

  this.draw = function(ctx, camera)
  {
    if (this.flash)
      this.drawInternal();

    ctx.save();
    ctx.translate(t.x - camera.x, t.y - camera.y);
    ctx.scale(scaleFactor, scaleFactor);

    ctx.strokeStyle = "rgba(0, 255, 255, 0.3)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    if (this.avoidUp)
    {
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -15);
    }
    if (this.avoidDown)
    {
      ctx.moveTo(0, 0);
      ctx.lineTo(0, 15);
    }
    if (this.avoidLeft)
    {
      ctx.moveTo(0, 0);
      ctx.lineTo(-15, 0);
    }
    if (this.avoidRight)
    {
      ctx.moveTo(0, 0);
      ctx.lineTo(15, 0);
    }
    ctx.closePath();
    ctx.stroke();

    ctx.beginPath();
    if (this.up)
    {
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -15);
    }
    if (this.down)
    {
      ctx.moveTo(0, 0);
      ctx.lineTo(0, 15);
    }
    if (this.left)
    {
      ctx.moveTo(0, 0);
      ctx.lineTo(-15, 0);
    }
    if (this.right)
    {
      ctx.moveTo(0, 0);
      ctx.lineTo(15, 0);
    }
    ctx.closePath();
    ctx.stroke();

    ctx.translate((this.canvas.width / -2), (this.canvas.width / -2));
    ctx.drawImage(this.canvas, 0, 0);

    ctx.restore();

    if (this.flash)
    {
      this.flash = false;
      this.drawInternal();
    }
  };
});