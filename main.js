/*
 * Copyright (c) 2006-2007 Erin Catto http://www.box2d.org
 *
 * This software is provided 'as-is', without any express or implied
 * warranty.  In no event will the authors be held liable for any damages
 * arising from the use of this software.
 * Permission is granted to anyone to use this software for any purpose,
 * including commercial applications, and to alter it and redistribute it
 * freely, subject to the following restrictions:
 * 1. The origin of this software must not be misrepresented; you must not
 * claim that you wrote the original software. If you use this software
 * in a product, an acknowledgment in the product documentation would be
 * appreciated but is not required.
 * 2. Altered source versions must be plainly marked as such, and must not be
 * misrepresented as being the original software.
 * 3. This notice may not be removed or altered from any source distribution.
 */

// goog.provide('box2d.HelloWorld');

// goog.require('box2d');

/**
 * This is a simple example of building and running a simulation
 * using Box2D. Here we create a large ground box and a small
 * dynamic box.
 * There are no graphics for this example. Box2D is meant to be
 * used with your rendering engine in your game engine.
 */
"use strict"
/**
 * @export
 * @return {number}
 * @param {Array.<*>=} args
 */

let world
let jumping = false;
let touchingParticles = []
let particleNormals = {}
let image = document.getElementById('splashBg');
let frames = 0;
let simulation = 'splash';
let counter = 0;

function mainApp(args) {

  function onload() {
      var gravity = new box2d.b2Vec2(0, 10);
      world = new box2d.b2World(gravity);
      var particleSystemDef = new box2d.b2ParticleSystemDef();
      world.CreateParticleSystem(particleSystemDef);
      Renderer = new Renderer(world);
      
      simulation = localStorage.getItem("simulation", simulation);
      document.getElementById('simSelect').value = simulation;

      // 10 == 100% of canvas
      createBoxBody(0,5,0,10) // leftwall
      createBoxBody(10,5,0,10) // right wall
      createBoxBody(5,5,10,0) // floor

      // check for which simulation is selected here and rerun onload to reload sim
      switch (simulation){
        case 'splash':
          makeSplash();
          break;
        case 'sprinkle':
          makeSprinkle();
          break;
        case 'bloop':
          makeBloop();
          break;
        case 'drip':
          makeDrip();
          break;
        case 'spray':
          makeSpray();
          break;
        default:
          makeSplash();
          break;
      }

      /*
      createBoxBody(3,4.5,.1,7,140) // left diagonal
      createBoxBody(7,4.5,.1,7, -140) // right diagonal
      circle = new box2d.b2CircleShape(1);

      pgd = new box2d.b2ParticleGroupDef();
      pgd.position= new box2d.b2Vec2(5,1)
      pgd.flags = box2d.b2ParticleFlag.b2_dynamicBody;
      pgd.groupFlags = box2d.b2ParticleGroupFlag.b2_solidParticleGroup;
      pgd.shape = circle;
      pgd.strength=.2
      
      pgd.color.Set(0, 255, 0, 255)
      world.GetParticleSystemList().SetRadius(.08);
      partgroup = world.GetParticleSystemList().CreateParticleGroup(pgd);
      */

      requestAnimationFrame(gameLoop);
  
      var listener = new box2d.b2ContactListener;
  
      listener.BeginContact = function(contact) {
        var fixtureA=contact.GetFixtureA();
        var fixtureB=contact.GetFixtureB()
      }
  
      world.SetContactListener(listener);
  }
  
  function createCircleBody(x,y){
      var bd = new box2d.b2BodyDef();
      // circle
      var bd = new box2d.b2BodyDef()
      bd.userData = {circle: true}
      var circle = new box2d.b2CircleShape(.1);
      bd.type = box2d.b2Body.box2d.b2_dynamicBody;
      bd.position.Set(x,y);
      var body = world.CreateBody(bd);
      var fixtureDef = body.CreateFixture(circle, 0.5);
      fixtureDef.userData = {type: "circle"}
      fixtureDef.SetRestitution(0.5);
  }
  
  function createBoxBody(x,y,width,height, angle = 0){
      // Create our body definition
      var groundBodyDef = new box2d.b2BodyDef();  
      // Set its world position
      groundBodyDef.position.Set(x,y);  
  
      // Create a body from the defintion and add it to the world
      var groundBody = world.CreateBody(groundBodyDef);  
  
      // Create a polygon shape
      var groundBox = new box2d.b2PolygonShape();  
      // Set the polygon shape as a box which is twice the size of our view port and 20 high
      // (setAsBox takes half-width and half-height as arguments)
      groundBox.SetAsBox(width/2,height/2,new box2d.b2Vec2(0,0),angle);
      // Create a fixture from our polygon shape and add it to our ground body  
      var fixtureDef = groundBody.CreateFixture(groundBox, 0.0);
      fixtureDef.userData = {type: "square"} 
  }
  
  let lastFrame = new Date().getTime();
  
  const gameLoop = function() {
      var tm = new Date().getTime();
      requestAnimationFrame(gameLoop);
      var dt = (tm - lastFrame) / 1000;
      if(dt > 1/15) { dt = 1/15; }
      update(dt);
      lastFrame = tm;
  };
  
  function update(){
     touchingParticles.length = 0
     world.GetParticleSystemList().m_bodyContactBuffer = new box2d.b2GrowableBuffer(function() {
      return new box2d.b2ParticleBodyContact();
    });
     
      world.Step(1/40,10,10);
      getTouchingParticles();

      Renderer.render(image);

      if (simulation === 'drip' && counter === 60) {
        counter = 0;
        makeDrip();
      } 
      else if (simulation === 'bloop' && counter === 300) {
        counter = 0;
        makeBlooper();
      }
      else if (simulation === 'sprinkle' && counter === 15) {
        counter = 0;
        makeSprinkle();
      }

      counter++;
  }

  function getTouchingParticles(){
    particleNormals = {};
    const system = world.GetParticleSystemList();
    var bodyContacts = system.GetBodyContacts();
    const contacts  = bodyContacts.filter(particle => {
      return particle.body;
   })

   bodyContacts.forEach(contact => {
       particleNormals[contact.index] = contact.normal
   })

   contacts.forEach(contact => {
     touchingParticles.push(contact.index)
    });
  }

  // drops a large circle of particles on to the canvas
  function makeSplash() {
    image = document.getElementById('splash');
    // create container
    createBoxBody(2,4,.1,7,150); // left diagonal
    createBoxBody(8,4,.1,7, -150); // right diagonal

    // create water
    var circle = new box2d.b2CircleShape(1.5);
    var pgd = new box2d.b2ParticleGroupDef();
    pgd.position = new box2d.b2Vec2(5,-4);
    pgd.flags = box2d.b2ParticleFlag.b2_dynamicBody;
    pgd.groupFlags = box2d.b2ParticleGroupFlag.b2_solidParticleGroup;
    pgd.shape = circle;
    pgd.strength = 0.0;
      
    pgd.color.Set(0, 255, 0, 255);
    world.GetParticleSystemList().SetRadius(.09);
    var partgroup = world.GetParticleSystemList().CreateParticleGroup(pgd); 
  }

  // fills the bottom with particles and drops a cube into it
  function makeBloop() {
    image = document.getElementById('bloop');
    // create container
    createBoxBody(2,4,.1,7,150); // left diagonal
    createBoxBody(8,4,.1,7, -150); // right diagonal

    // create water
    var circle = new box2d.b2CircleShape(1.5);
    var pgd = new box2d.b2ParticleGroupDef();
    pgd.position = new box2d.b2Vec2(5,3);
    pgd.flags = box2d.b2ParticleFlag.b2_dynamicBody;
    pgd.groupFlags = box2d.b2ParticleGroupFlag.b2_solidParticleGroup;
    pgd.shape = circle;
    pgd.strength = 0.2;
      
    pgd.color.Set(0, 255, 0, 255);
    world.GetParticleSystemList().SetRadius(.09);
    var partgroup = world.GetParticleSystemList().CreateParticleGroup(pgd); 
  }

  function makeBlooper(){
    // create splash cube
    var box = new box2d.b2PolygonShape();
    box.SetAsBox(0.3,0.3);
    var pgdBox = new box2d.b2ParticleGroupDef();
    pgdBox.position = new box2d.b2Vec2(5,-1);
    pgdBox.flags = box2d.b2ParticleFlag.b2_dynamicBody;
    pgdBox.groupFlags = box2d.b2ParticleGroupFlag.b2_rigidParticleGroup;
    pgdBox.shape = box;
    pgdBox.strength= 1;
    
    var partgroup = world.GetParticleSystemList().CreateParticleGroup(pgdBox); 
  }

  // spawns three particles each time called every third frame? 
  function makeSprinkle() {
    image = document.getElementById('sprinkle');

    var random = Math.floor(Math.random() * (+9 - +1)) + +0; 

    // create container
    createBoxBody(3,4.5,.1,7,140); // left diagonal
    createBoxBody(7,4.5,.1,7, -140); // right diagonal

    // create water
    var circle = new box2d.b2CircleShape(0.05);
    var pgd = new box2d.b2ParticleGroupDef();
    pgd.position = new box2d.b2Vec2(random,-1);
    pgd.flags = box2d.b2ParticleFlag.b2_dynamicBody;
    pgd.groupFlags = box2d.b2ParticleGroupFlag.b2_solidParticleGroup;
    pgd.shape = circle;
    pgd.strength = 0.2;
      
    pgd.color.Set(0, 255, 0, 255);
    world.GetParticleSystemList().SetRadius(.08);
    var partgroup = world.GetParticleSystemList().CreateParticleGroup(pgd); 
  }

  // spawns two of the same particle groups in top of eachother so they 'explode'
  function makeSpray(){
    image = document.getElementById('spray');
    createBoxBody(5,0,10,0) // ceiling

    for (var i = 0; i < 2; i++){
      // create water
      var circle = new box2d.b2CircleShape(1);
      var pgd = new box2d.b2ParticleGroupDef();
      pgd.position = new box2d.b2Vec2(5,2);
      pgd.flags = box2d.b2ParticleFlag.b2_dynamicBody;
      pgd.groupFlags = box2d.b2ParticleGroupFlag.b2_solidParticleGroup;
      pgd.shape = circle;
      pgd.strength = 0.2;
      
      pgd.color.Set(0, 255, 0, 255);
      world.GetParticleSystemList().SetRadius(.06);
      var partgroup = world.GetParticleSystemList().CreateParticleGroup(pgd); 
    }
  }

  // spawns a single particle above the canvas, drops one particle on a counter
  function makeDrip() {
    image = document.getElementById('drip');
    // create container
    createBoxBody(3,4.5,.1,7,140); // left diagonal
    createBoxBody(7,4.5,.1,7, -140); // right diagonal

    // create water
    var circle = new box2d.b2CircleShape(0.1);
    var pgd = new box2d.b2ParticleGroupDef();
    pgd.position = new box2d.b2Vec2(5,-1);
    pgd.flags = box2d.b2ParticleFlag.b2_dynamicBody;
    pgd.groupFlags = box2d.b2ParticleGroupFlag.b2_solidParticleGroup;
    pgd.shape = circle;
    pgd.strength = 0.2;
      
    pgd.color.Set(0, 255, 0, 255);
    world.GetParticleSystemList().SetRadius(.08);
    var partgroup = world.GetParticleSystemList().CreateParticleGroup(pgd); 
  }

  onload();
}

function reloadSimulation() { 
  simulation = document.getElementById('simSelect').value;
  localStorage.setItem("simulation", simulation);

  document.location.reload(true)
  //mainApp();
}
