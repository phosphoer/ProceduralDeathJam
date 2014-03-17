TANK.registerComponent("Bullet")

.interfaces("Drawable")

.requires("Pos2D, Velocity, Collider")

.construct(function()
{
  this.canvas = document.createElement("canvas");
  this.canvas.width = 1;
  this.canvas.height = 1;
  this.context = this.canvas.getContext("2d");
})

.initialize(function()
{
  this.parent.Collider.width = 1 * TANK.World.scaleFactor;
  this.parent.Collider.height = 1 * TANK.World.scaleFactor;
  this.parent.Collider.collisionLayer = "Bullets";
  this.parent.Collider.collidesWith = ["Enemies"];
  this.parent.Collider.collidesWith = ["Player"];

  this.context.fillStyle = "#fff";
  this.context.fillRect(0, 0, 1, 1);

  this.addEventListener("OnEnterFrame", function(dt)
  {
    if (!TANK.World)
      return;
      
    if (TANK.World.testCollisionAtPoint(this.parent.Pos2D.x, this.parent.Pos2D.y))
    {
      TANK.removeEntity(this.parent);
    }
  });

  this.draw = function(ctx, camera)
  {
    if (!TANK.World)
      return;
      
    ctx.save();
    ctx.translate(this.parent.Pos2D.x - camera.x, this.parent.Pos2D.y - camera.y);
    ctx.scale(TANK.World.scaleFactor, TANK.World.scaleFactor);
    ctx.drawImage(this.canvas, 0, 0);
    ctx.restore();
  };
});
