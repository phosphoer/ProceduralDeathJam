TANK.registerComponent("Part")

.interfaces("Drawable")

.requires("Pos2D, Velocity")

.construct(function()
{
  this.rotateSpeed = -5 + Math.random() * 10;
})

.initialize(function()
{
  var scaleFactor = TANK.World.scaleFactor;
  var t = this.parent.Pos2D;

  var angle = Math.random() * Math.PI * 2;
  var speed = 60 + Math.random() + 100;
  this.parent.Velocity.x = Math.cos(angle) * speed;
  this.parent.Velocity.y = Math.sin(angle) * speed;

  this.addEventListener("OnEnterFrame", function(dt)
  {
    // Check for walls
    if (TANK.World.testCollisionAtPoint(t.x, t.y))
      TANK.removeEntity(this.parent);

    this.parent.Velocity.y += dt * 400;
    t.rotation += this.rotateSpeed * dt;
  });

  this.draw = function(ctx, camera)
  {
    ctx.save();
    ctx.translate(t.x - camera.x, t.y - camera.y);
    ctx.rotate(t.rotation);
    ctx.scale(scaleFactor, scaleFactor);
    ctx.translate(-3, -3);

    ctx.fillStyle = "#f55";
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(6, 0);
    ctx.lineTo(6, 4);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  };
});

TANK.registerComponent("Particle")

.interfaces("Drawable")

.requires("Pos2D, Velocity")

.construct(function()
{
  this.zdepth = 5;
  this.friction = 0.9;
  this.color = "#f55";
  this.life = 2;
  this.angle = 0;
  this.speed = 50;
  this.size = [1, 1];
})

.initialize(function()
{
  var t = this.parent.Pos2D;
  var v = this.parent.Velocity;

  v.x = Math.cos(this.angle) * this.speed;
  v.y = Math.sin(this.angle) * this.speed;

  this.addEventListener("OnEnterFrame", function(dt)
  {
    this.life -= dt;
    if (this.life < 0)
      TANK.removeEntity(this.parent);

    v.x *= this.friction;
    v.y *= this.friction;
  });

  this.draw = function(ctx, camera)
  {
    ctx.save();
    ctx.translate(t.x - camera.x, t.y - camera.y);
    ctx.scale(TANK.World.scaleFactor, TANK.World.scaleFactor);
    ctx.translate(this.size[0] / -2, this.size[1] / -2);

    ctx.fillStyle = this.color;
    ctx.fillRect(0, 0, this.size[0], this.size[1]);

    ctx.restore();
  };
});