TANK.registerComponent("Enemy")

.interfaces("Drawable")

.construct(function()
{
})

.initialize(function()
{
  this.draw = function(ctx, camera)
  {
    TANK.RenderManager.camera.x = Math.round((this.parent.Pos2D.x) * TANK.World.cellSize - window.innerWidth / 2);
    TANK.RenderManager.camera.y = Math.round((this.parent.Pos2D.y) * TANK.World.cellSize - window.innerHeight / 2);

    var t = this.parent.Pos2D;
    ctx.translate(-camera.x, -camera.y);


    ctx.save();
    ctx.fillStyle = "#55d";
    ctx.fillRect(t.x * TANK.World.cellSize, t.y * TANK.World.cellSize, TANK.World.cellSize, TANK.World.cellSize);
    ctx.restore();
  };
});