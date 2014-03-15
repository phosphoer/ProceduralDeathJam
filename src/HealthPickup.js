TANK.registerComponent("HealthPickup")

.interfaces("Drawable")

.requires("Pos2D, Collider")

.construct(function()
{
  this.zdepth = 1;
  this.value = 2;
  this.elapsed = 0;

  this.size = [5, 5];
})

.initialize(function()
{
  var scaleFactor = TANK.World.scaleFactor;
  var t = this.parent.Pos2D;

  this.parent.Collider.collisionLayer = "Pickups";
  this.parent.Collider.collidesWith = ["Player"];
  this.parent.Collider.width = this.size[0] * scaleFactor;
  this.parent.Collider.height = this.size[1] * scaleFactor;

  this.addEventListener("OnEnterFrame", function(dt)
  {
    this.elapsed += dt;

    t.y += Math.sin(this.elapsed * 3) * 0.2;
  });

  this.draw = function(ctx, camera)
  {
    ctx.save();
    ctx.translate(t.x - camera.x, t.y - camera.y);
    ctx.scale(scaleFactor, scaleFactor);
    ctx.translate((this.size[0] / -2), (this.size[1] / -2));

    ctx.fillStyle = "#8f8";
    ctx.fillRect(0, 0, this.size[0], this.size[0]);

    ctx.restore();
  };
});