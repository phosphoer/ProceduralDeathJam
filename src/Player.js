TANK.registerComponent("Player")

.interfaces("Drawable")

.requires("Pos2D")

.construct(function()
{
  this.zdepth = 1;
  this.health = 10;
  this.xp = 0;
  this.nextLevel = 10;
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
      else if (cell === 2)
        this.goThroughDoor();
    }
    if (keycode === TANK.Key.A)
    {
      var cell = TANK.World.getCellAt(this.parent.Pos2D.x - 1, this.parent.Pos2D.y);
      if (cell === 0)
        this.parent.Pos2D.x -= 1;
      else if (cell === 2)
        this.goThroughDoor();
    }
    if (keycode === TANK.Key.S)
    {
      var cell = TANK.World.getCellAt(this.parent.Pos2D.x, this.parent.Pos2D.y + 1);
      if (cell === 0)
        this.parent.Pos2D.y += 1;
      else if (cell === 2)
        this.goThroughDoor();
    }
    if (keycode === TANK.Key.D)
    {
      var cell = TANK.World.getCellAt(this.parent.Pos2D.x + 1, this.parent.Pos2D.y);
      if (cell === 0)
        this.parent.Pos2D.x += 1;
      else if (cell === 2)
        this.goThroughDoor();
    }
  });

  this.goThroughDoor = function()
  {
    TANK.World.generateNewWorld();
    this.parent.Pos2D.x = TANK.World.spawnPos[0];
    this.parent.Pos2D.y = TANK.World.spawnPos[1];
  };

  this.draw = function(ctx, camera)
  {
    TANK.RenderManager.camera.x = Math.round((this.parent.Pos2D.x) * TANK.World.cellSize - window.innerWidth / 2);
    TANK.RenderManager.camera.y = Math.round((this.parent.Pos2D.y) * TANK.World.cellSize - window.innerHeight / 2);

    var t = this.parent.Pos2D;
    ctx.translate(-camera.x, -camera.y);


    ctx.save();
    ctx.fillStyle = "#5d5";
    ctx.fillRect(t.x * TANK.World.cellSize, t.y * TANK.World.cellSize, TANK.World.cellSize, TANK.World.cellSize);
    ctx.restore();
  };
});