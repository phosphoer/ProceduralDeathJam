TANK.registerComponent("Spike")

.interfaces("Drawable")

.requires("Pos2D, Velocity, Collider")

.construct(function()
{
  this.zdepth = -1;
  this.falling = false;
})

.initialize(function()
{
  this.parent.Collider.width = 2 * TANK.World.scaleFactor;
  this.parent.Collider.height = 2 * TANK.World.scaleFactor;
  this.parent.Collider.collisionLayer = "Bullets";
  this.parent.Collider.collidesWith = ["Enemies"];
  this.parent.Collider.collidesWith = ["Player"];

  var t = this.parent.Pos2D;

  this.addEventListener("OnEnterFrame", function(dt)
  {
    if (!TANK.World)
      return;

    // Die if point hits ground
    if (TANK.World.testCollisionAtPoint(this.parent.Pos2D.x, this.parent.Pos2D.y + 6))
    {
      TANK.removeEntity(this.parent);
    }

    // Fall if player goes under
    var player = TANK.getEntity("Player");
    if (player)
    {
      if (Math.abs(player.Pos2D.x - t.x) < 50 && player.Pos2D.y > t.y && player.Pos2D.y < t.y + 400)
      {
        this.falling = true;
      }
    }

    if (this.falling)
      this.parent.Velocity.y += 350 * dt;
  });

  this.draw = function(ctx, camera)
  {
    if (!TANK.World)
      return;

    ctx.save();
    ctx.translate(this.parent.Pos2D.x - camera.x, this.parent.Pos2D.y - camera.y);
    ctx.scale(TANK.World.scaleFactor, TANK.World.scaleFactor);

    ctx.fillStyle = "#333";
    ctx.beginPath();
    ctx.moveTo(-2, 0);
    ctx.lineTo(2, 0);
    ctx.lineTo(0, 6);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  };
});