(function(){
  try{
    const cv=document.getElementById('bg3d'); if(!window.THREE||!cv) return;
    const scene=new THREE.Scene();
    const cam=new THREE.PerspectiveCamera(42,1,.1,100);
    cam.position.set(0,0,27);
    const rnd=new THREE.WebGLRenderer({canvas:cv,alpha:true,antialias:true,powerPreference:'high-performance'});
    rnd.setPixelRatio(Math.min(devicePixelRatio,1.8));
    rnd.outputEncoding=THREE.sRGBEncoding;
    const mark=new THREE.Group();
    mark.position.set(8.3,.35,-.8);
    mark.rotation.set(-.2,.18,-.03);
    scene.add(mark);
    const palette=[0x6ac6cb,0x3bb8c1,0x259fab,0x105e87,0x04375f];
    const materials=palette.map((color,i)=>new THREE.MeshStandardMaterial({color,emissive:color,emissiveIntensity:i<2?.11:.055,metalness:.22,roughness:.54,flatShading:true,side:THREE.DoubleSide}));
    const rotor=new THREE.Group();
    mark.add(rotor);
    const gradientColors=palette.map(color=>new THREE.Color(color));
    const petalCount=7;
    const petalSectorAngle=Math.PI*2/petalCount;
    const logoReferenceAngle=THREE.MathUtils.degToRad(57);
    const outerPositionColors=[0,2,3,4,4,3,1];
    const innerPositionColors=[1,3,4,4,3,2,0];
    const petalMeshes=[];
    const modelRoot=new THREE.Group();
    rotor.add(modelRoot);
    const maxCutters=10;
    const cutterPositions=Array.from({length:maxCutters},()=>new THREE.Vector3(999,999,999));
    const cutterRadii=new Float32Array(maxCutters);
    const cutterAngles=new Float32Array(maxCutters);
    function prepareMaterial(source){
      const material=source.clone();
      material.side=THREE.DoubleSide;
      material.metalness=.18;
      material.roughness=.46;
      material.emissive=new THREE.Color(material.color);
      material.emissiveIntensity=.075;
      material.onBeforeCompile=shader=>{
        shader.uniforms.uBooleanCutters={value:cutterPositions};
        shader.uniforms.uBooleanRadii={value:cutterRadii};
        shader.uniforms.uBooleanAngles={value:cutterAngles};
        shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vBooleanWorldPosition;').replace('#include <project_vertex>','#include <project_vertex>\nvBooleanWorldPosition=(modelMatrix*vec4(transformed,1.0)).xyz;');
        shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vBooleanWorldPosition;\nuniform vec3 uBooleanCutters[10];\nuniform float uBooleanRadii[10];\nuniform float uBooleanAngles[10];\nfloat sdTriangle(vec2 p,float r){const float k=1.7320508;p.x=abs(p.x)-r;p.y=p.y+r/k;if(p.x+k*p.y>0.0)p=vec2(p.x-k*p.y,-k*p.x-p.y)/2.0;p.x-=clamp(p.x,-2.0*r,0.0);return-length(p)*sign(p.y);}').replace('#include <clipping_planes_fragment>','#include <clipping_planes_fragment>\nfor(int i=0;i<10;i++){float a=uBooleanAngles[i];vec3 d=vBooleanWorldPosition-uBooleanCutters[i];vec2 p=mat2(cos(a),-sin(a),sin(a),cos(a))*d.xy;float triangle=sdTriangle(p,uBooleanRadii[i]);float prism=max(triangle,abs(d.z)-uBooleanRadii[i]*1.35);if(uBooleanRadii[i]>0.0&&prism<0.0)discard;}');
      };
      material.customProgramCacheKey=()=>'b2h4-boolean-v1';
      return material;
    }
    function applyPetalColor(material,color){material.color.copy(color);material.emissive.copy(color);}
    function installModel(model){
      model.rotation.x=Math.PI/2;
      model.updateMatrixWorld(true);
      const box=new THREE.Box3().setFromObject(model);
      const center=box.getCenter(new THREE.Vector3());
      const size=box.getSize(new THREE.Vector3());
      const modelScale=18.3/Math.max(size.x,size.y,size.z);
      model.scale.multiplyScalar(modelScale);
      model.position.copy(center).multiplyScalar(-modelScale);
      const pairs=Array.from({length:petalCount},(_,index)=>({index,mainMaterial:null,accentMaterial:null,anchorMeshes:[],anchorLocal:new THREE.Vector3(),currentPosition:new THREE.Vector3(),mainColor:new THREE.Color(),accentColor:new THREE.Color(),currentColorIndex:0}));
      model.traverse(object=>{
        if(!object.isMesh) return;
        let petalGroup=object;
        while(petalGroup.parent&&petalGroup.parent!==model) petalGroup=petalGroup.parent;
        const loadedNumber=Number((petalGroup.name.match(/^path(?:572-5|573-8)0*(\d+)$/)||[])[1]);
        const index=Number.isFinite(loadedNumber)?Math.max(0,Math.min(6,loadedNumber-7)):0;
        const materialGroup=petalGroup.name.startsWith('path573')?'accentMaterial':'mainMaterial';
        const sourceMaterial=Array.isArray(object.material)?object.material[0]:object.material;
        if(!pairs[index][materialGroup]){pairs[index][materialGroup]=prepareMaterial(sourceMaterial);pairs[index][materialGroup].name=`petal-${index+1}-${materialGroup==='mainMaterial'?'outer':'inner'}`;}
        object.material=pairs[index][materialGroup];
        object.castShadow=false;object.receiveShadow=false;
        if(materialGroup==='mainMaterial') pairs[index].anchorMeshes.push(object);
      });
      pairs.forEach(pair=>{if(pair.mainMaterial&&pair.accentMaterial)petalMeshes.push(pair);});
      modelRoot.add(model);
      scene.updateMatrixWorld(true);
      petalMeshes.forEach(petal=>{
        petal.anchorMeshes.forEach(mesh=>{
          mesh.geometry.computeBoundingBox();
          const center=mesh.geometry.boundingBox.getCenter(new THREE.Vector3());
          mesh.localToWorld(center);rotor.worldToLocal(center);
          petal.anchorLocal.add(center);
        });
        petal.anchorLocal.multiplyScalar(1/petal.anchorMeshes.length);
      });
    }
    if(THREE.GLTFLoader){
      const loader=new THREE.GLTFLoader();
      if(window.B2H4_GLB_BASE64){
        const binary=atob(window.B2H4_GLB_BASE64);
        const bytes=new Uint8Array(binary.length);
        for(let i=0;i<binary.length;i++) bytes[i]=binary.charCodeAt(i);
        loader.parse(bytes.buffer,'',gltf=>installModel(gltf.scene),error=>console.warn('Modelo B2H4 3D indisponível',error));
      }else{
        loader.load('lp-assets/models/logo-b2h4-3d.glb',gltf=>installModel(gltf.scene),undefined,error=>console.warn('Modelo B2H4 3D indisponível',error));
      }
    }
    const halo=new THREE.Mesh(new THREE.TorusGeometry(9,.035,4,96),new THREE.MeshBasicMaterial({color:0x10b5cb,transparent:true,opacity:.14}));
    mark.add(halo);
    let seed=284;
    function random(){seed=(seed*16807)%2147483647;return(seed-1)/2147483646;}
    const shards=new THREE.Group();
    const shardMeshes=[];
    mark.add(shards);
    const shardCount=84;
    for(let i=0;i<shardCount;i++){
      const size=.12+random()*.4;
      const geo=new THREE.CylinderGeometry(size,size*.82,.16+random()*.14,3,1,false);
      geo.rotateX(Math.PI/2);
      const colorIndex=Math.floor(random()*palette.length);
      const shard=new THREE.Mesh(geo,materials[colorIndex].clone());
      const lane=(i+.5)/shardCount;
      const impactAngle=Math.PI*(.2512+lane*1.4976)+(random()-.5)*.07;
      const innerRadius=4.75+random()*.85;
      const outletHeight=1.595;
      const outletSpread=Math.abs(lane-.5)*2;
      const outletX=-.55-outletSpread*.55+(random()-.5)*.18;
      const baseScale=new THREE.Vector3(.75+random()*.65,.6+random()*1.15,.7+random()*.6);
      shard.userData={start:new THREE.Vector3(-21-random()*3.5,(random()-.5)*1.05,(random()-.5)*.75),inner:new THREE.Vector3(outletX,Math.sin(impactAngle)*innerRadius*outletHeight,(random()-.5)*.4),baseScale,cutRadius:size*(1.7+random()*.8),axis:new THREE.Vector3(random()-.5,random()-.5,random()-.5).normalize(),phase:random()*Math.PI*2,offset:random(),speed:.045+random()*.055,lastProgress:0,touchedPetal:false,touchingPetal:false,released:false,releaseProgress:1,releasePosition:new THREE.Vector3(),contactStrength:0,contactDistance:Infinity};
      shards.add(shard);shardMeshes.push(shard);
    }
    const dust=new THREE.BufferGeometry();
    const dustPos=[];
    for(let i=0;i<24;i++) dustPos.push(-6-random()*7,(random()-.5)*6.8,(random()-.5)*2);
    dust.setAttribute('position',new THREE.Float32BufferAttribute(dustPos,3));
    const points=new THREE.Points(dust,new THREE.PointsMaterial({color:0x6ac6cb,size:.055,transparent:true,opacity:.42,sizeAttenuation:true}));
    mark.add(points);
    scene.add(new THREE.HemisphereLight(0x93f7ff,0x020611,.76));
    const key=new THREE.DirectionalLight(0xa4fbff,1.28);key.position.set(7,8,12);scene.add(key);
    const rim=new THREE.PointLight(0x0b84b7,1.42,45);rim.position.set(-7,-5,8);scene.add(rim);
    const pointer={x:0,y:0};
    const reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;
    if(matchMedia('(pointer:fine)').matches){addEventListener('pointermove',e=>{pointer.x=(e.clientX/innerWidth-.5)*2;pointer.y=(e.clientY/innerHeight-.5)*2;},{passive:true});}
    function size(){
      const w=cv.clientWidth||cv.parentElement.clientWidth;
      const h=cv.clientHeight||cv.parentElement.clientHeight;
      rnd.setSize(w,h,false);
      cam.aspect=w/h;
      cam.updateProjectionMatrix();
      mark.scale.setScalar(w<900?.32:.72);
      mark.position.x=w<900?0:9;
      mark.position.y=w<900?-2:.2;
    }
    const clock=new THREE.Clock();
    const worldPosition=new THREE.Vector3();
    function draw(){
      const t=clock.getElapsedTime();
      const motion=reduced?0:t;
      rotor.rotation.z=-motion*.115;
      rotor.rotation.y=Math.sin(motion*.23)*.035;
      rotor.updateMatrix();
      petalMeshes.forEach(petal=>{
        petal.currentPosition.copy(petal.anchorLocal).applyMatrix4(rotor.matrix);
        const angle=Math.atan2(petal.currentPosition.y,petal.currentPosition.x);
        const sectorPosition=((((logoReferenceAngle-angle)/petalSectorAngle)%petalCount)+petalCount)%petalCount;
        const sector=Math.floor(sectorPosition);
        const nextSector=(sector+1)%petalCount;
        const linearFade=sectorPosition-sector;
        const colorFade=linearFade*linearFade*(3-2*linearFade);
        petal.mainColor.lerpColors(gradientColors[outerPositionColors[sector]],gradientColors[outerPositionColors[nextSector]],colorFade);
        petal.accentColor.lerpColors(gradientColors[innerPositionColors[sector]],gradientColors[innerPositionColors[nextSector]],colorFade);
        petal.currentColorIndex=colorFade<.5?outerPositionColors[sector]:outerPositionColors[nextSector];
        applyPetalColor(petal.mainMaterial,petal.mainColor);
        applyPetalColor(petal.accentMaterial,petal.accentColor);
      });
      shardMeshes.forEach(shard=>{
        const u=shard.userData;
        const progress=(u.offset+motion*u.speed)%1;
        if(progress<u.lastProgress){u.touchedPetal=false;u.touchingPetal=false;u.released=false;u.releaseProgress=1;u.contactStrength=0;u.contactDistance=Infinity;}
        const travel=Math.min(1,progress/.96);
        if(u.released) shard.position.copy(u.releasePosition);
        else shard.position.lerpVectors(u.start,u.inner,travel);
        const appear=Math.min(1,progress/.05);
        shard.quaternion.setFromAxisAngle(u.axis,motion*(.35+u.speed*7)+u.phase);
        let nearestPetal=null,nearestDistance=Infinity;
        petalMeshes.forEach(petal=>{const d=shard.position.distanceToSquared(petal.currentPosition);if(d<nearestDistance){nearestDistance=d;nearestPetal=petal;}});
        const radialDistance=Math.hypot(shard.position.x,shard.position.y);
        const touchingPetal=!u.released&&progress>.48&&nearestDistance<12.25&&radialDistance>3.85;
        if(touchingPetal) u.touchedPetal=true;
        if(!u.released&&progress>.55&&((u.touchedPetal&&!touchingPetal)||radialDistance<3.85)){u.released=true;u.releaseProgress=progress;u.releasePosition.copy(shard.position);}
        u.touchingPetal=touchingPetal&&!u.released;u.contactDistance=nearestDistance;
        u.contactStrength=u.touchingPetal?Math.min(1,u.contactStrength+.12):Math.max(0,u.contactStrength-.18);
        const releasedFade=u.released?Math.max(0,1-(progress-u.releaseProgress)/.025):1;
        const cycleFade=progress>.94?Math.max(0,(.98-progress)/.04):1;
        const visibility=appear*releasedFade*cycleFade;
        shard.scale.copy(u.baseScale).multiplyScalar(visibility*(1+u.contactStrength*.12));
        shard.visible=visibility>.025;
        if(nearestPetal){shard.material.color.lerp(nearestPetal.mainColor,.1);shard.material.emissive.lerp(nearestPetal.mainColor,.1);}
        u.lastProgress=progress;
      });
      mark.rotation.y+=(.18+pointer.x*.065-mark.rotation.y)*.025;
      mark.rotation.x+=(-.2-pointer.y*.05-mark.rotation.x)*.025;
      halo.rotation.z=motion*.025;
      points.rotation.z=-motion*.012;
      scene.updateMatrixWorld(true);
      let cutterIndex=0;
      const activeCutters=shardMeshes.filter(s=>s.userData.touchingPetal&&!s.userData.released&&s.userData.contactStrength>.05);
      const halfCutters=maxCutters/2;
      const balancedCutters=[...activeCutters.filter(s=>s.position.y>=0).sort((a,b)=>a.userData.contactDistance-b.userData.contactDistance).slice(0,halfCutters),...activeCutters.filter(s=>s.position.y<0).sort((a,b)=>a.userData.contactDistance-b.userData.contactDistance).slice(0,halfCutters)];
      balancedCutters.forEach(shard=>{shard.getWorldPosition(worldPosition);cutterPositions[cutterIndex].copy(worldPosition);cutterRadii[cutterIndex]=shard.userData.cutRadius*shard.userData.contactStrength*mark.scale.x;cutterAngles[cutterIndex]=-shard.rotation.z+rotor.rotation.z;cutterIndex++;});
      for(let i=cutterIndex;i<maxCutters;i++){cutterPositions[i].set(999,999,999);cutterRadii[i]=0;cutterAngles[i]=0;}
      rnd.render(scene,cam);
      requestAnimationFrame(draw);
    }
    addEventListener('resize',size,{passive:true});
    size();draw();
  }catch(err){console.warn('B2H4 3D indisponível',err);}
})();
