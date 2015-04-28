TANK.registerComponent("Game")

.construct(function()
{
  this.restarting = true;
  this.restartTimer = 0;
})

.initialize(function()
{
  TANK.RenderManager.clearColor = "#000";
  Wave.load("res/shoot.wav", "shoot");
  Wave.load("res/explode1.wav", "explode1");
  Wave.load("res/explode2.wav", "explode2");
  Wave.load("res/hit.wav", "hit");
  Wave.load("res/hit2.wav", "hit2");
  Wave.load("res/powerup.wav", "powerup");

  this.barUI = $("<div></div>");
  this.barUI.addClass("bar");
  this.barUI.appendTo($("body"));


  if (!localStorage["pdj-phosphoer-save"])
    localStorage["pdj-phosphoer-save"] = JSON.stringify({collected: 0, distance: 0, kills: 0});
  var save = JSON.parse(localStorage["pdj-phosphoer-save"]);

  this.recordUI = $("<div></div>");
  this.recordUI.addClass("max-indicator");
  this.recordUI.appendTo(this.barUI);
  this.recordUILabel = $("<span class='max-indicator-label'>Best - </span>");
  this.recordUILabel.appendTo(this.recordUI);
  this.recordUIValueA = $("<span class='score-indicator-value'></span>");
  this.recordUIValueA.appendTo(this.recordUI)
  this.recordUISep = $("<span class='score-sep'> / </span>");
  this.recordUISep.appendTo(this.recordUI);
  this.recordUIValueB = $("<span class='collected-indicator-value'></span>");
  this.recordUIValueB.appendTo(this.recordUI);
  this.recordUISep = $("<span class='score-sep'> / </span>");
  this.recordUISep.appendTo(this.recordUI);
  this.recordUIValueC = $("<span class='kills-indicator-value'></span>");
  this.recordUIValueC.appendTo(this.recordUI);

  this.recordUIValueA.text(save.distance + "m");
  this.recordUIValueB.text(save.collected);
  this.recordUIValueC.text(save.kills || 0);

  this.addEventListener("OnGenerationComplete", function()
  {
    this.tutorialUI = $("<div class='tutorial'>WASD - Move, Space - Shoot</div>");
    this.tutorialUI.appendTo($("body"));
    this.tutorialUI.fadeIn(5000, function()
      {
        $(this).fadeOut(5000, function()
        {
          $(this).remove();
        });
      });

    $("#curtain").animate({
      opacity: 0
    }, 1000);
  });

  this.restart = function()
  {
    this.restarting = true;
    this.restartTimer = 3;

    $("#curtain").animate({
      opacity: 1
    }, 4000);
  };

  this.spawnPlayer = function()
  {
    var e = TANK.createEntity("Player");
    TANK.addEntity(e, "Player");
  };

  this.update = function(dt)
  {
    if (this.restarting)
      this.restartTimer -= dt;

    if (this.restarting && !TANK.World)
    {
      TANK.addComponent("World");
      this.spawnPlayer();
      this.restarting = false;
    }
    if (this.restarting && this.restartTimer < 0 && TANK.World)
    {
      TANK.removeComponent("World");
    }
  };
});