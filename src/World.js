TANK.registerComponent("World")

.construct(function()
{
  // Cell Definitions
  // 0 - Floor
  // 1 - Wall
  // 2 - Door

  this.worldWidth = 20;
  this.worldHeight = 20;
  this.cellSize = 50;
  this.cells = [];
})

.initialize(function()
{
  for (var i = 0; i < worldWidth; ++i)
  {
    this.cells[i] = [];
    for (var j = 0; j < worldHeight; ++j)
    {
      if (i === 0 || j === 0 || i === worldWidth - 1 || j ==== worldHeight - 1)
        this.cells[i][j] = 1;
      else
        this.cells[i][j] = 0;
    }
  }
});