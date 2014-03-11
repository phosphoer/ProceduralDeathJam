TANK.registerComponent("Player")

.interfaces("Drawable")

.requires("Pos2D, Velocity")

.construct(function()
{
  this.zdepth = 1;

  this.turnAccel = 5;
  this.accel = 100;

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

  this.shoot = function()
  {
    var e = TANK.createEntity("Bullet");
    e.Pos2D.x = this.parent.Pos2D.x;
    e.Pos2D.y = this.parent.Pos2D.y;
    e.Velocity.x = Math.cos(this.parent.Pos2D.rotation) * 500;
    e.Velocity.y = Math.sin(this.parent.Pos2D.rotation) * 500;
    TANK.addEntity(e);
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
      TANK.removeEntity(this.parent);
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

    ctx.restore();

    // ctx.save();
    // ctx.translate(this.parent.Pos2D.x - camera.x, this.parent.Pos2D.y - camera.y);
    // ctx.scale(TANK.World.scaleFactor, TANK.World.scaleFactor);
    // ctx.translate(-4, -4);
    // ctx.drawImage(this.colCanvas, 0, 0);
    // ctx.restore();
  };
});