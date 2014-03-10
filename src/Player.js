TANK.registerComponent("Player")

.interfaces("Drawable")

.requires("Pos2D")

.construct(function()
{
  this.zdepth = 1;
})

.initialize(function()
{
  this.addEventListener("OnKeyPress", function(keycode)
  {
    if (keycode === TANK.Key.W)
    {
      var cell = TANK.World.getCellAt(this.parent.Pos2D.x, this.parent.Pos2D.y - 1);
      if (cell === 0)
        this.parent.Pos2D.y -= 1;
    }
    if (keycode === TANK.Key.A)
    {
      var cell = TANK.World.getCellAt(this.parent.Pos2D.x - 1, this.parent.Pos2D.y);
      if (cell === 0)
        this.parent.Pos2D.x -= 1;
    }
    if (keycode === TANK.Key.S)
    {
      var cell = TANK.World.getCellAt(this.parent.Pos2D.x, this.parent.Pos2D.y + 1);
      if (cell === 0)
        this.parent.Pos2D.y += 1;
    }
    if (keycode === TANK.Key.D)
    {
      var cell = TANK.World.getCellAt(this.parent.Pos2D.x + 1, this.parent.Pos2D.y);
      if (cell === 0)
        this.parent.Pos2D.x += 1;
    }
  });

  this.draw = function(ctx, camera)
  {
    var t = this.parent.Pos2D;

    ctx.save();
    ctx.fillStyle = "#5d5";
    ctx.fillRect(t.x * TANK.World.cellSize, t.y * TANK.World.cellSize, TANK.World.cellSize, TANK.World.cellSize);
    ctx.restore();
  };
});