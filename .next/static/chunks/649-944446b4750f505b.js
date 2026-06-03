"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[649],{4195:(e,t,n)=>{n.d(t,{A:()=>r});function r(){return function(e){function t(e,t){for(var n,r,i,a,o,s=/([MLQCZ])([^MLQCZ]*)/g;n=s.exec(e);){var l=n[2].replace(/^\s*|\s*$/g,"").split(/[,\s]+/).map(function(e){return parseFloat(e)});switch(n[1]){case"M":a=r=l[0],o=i=l[1];break;case"L":(l[0]!==a||l[1]!==o)&&t("L",a,o,a=l[0],o=l[1]);break;case"Q":t("Q",a,o,a=l[2],o=l[3],l[0],l[1]);break;case"C":t("C",a,o,a=l[4],o=l[5],l[0],l[1],l[2],l[3]);break;case"Z":(a!==r||o!==i)&&t("L",a,o,r,i)}}}function n(e,n,r){void 0===r&&(r=16);var i={x:0,y:0};t(e,function(e,t,a,o,s,l,f,c,u){switch(e){case"L":n(t,a,o,s);break;case"Q":for(var d=t,v=a,p=1;p<r;p++)!function(e,t,n,r,i,a,o,s){var l=1-o;s.x=l*l*e+2*l*o*n+o*o*i,s.y=l*l*t+2*l*o*r+o*o*a}(t,a,l,f,o,s,p/(r-1),i),n(d,v,i.x,i.y),d=i.x,v=i.y;break;case"C":for(var h=t,m=a,g=1;g<r;g++)!function(e,t,n,r,i,a,o,s,l,f){var c=1-l;f.x=c*c*c*e+3*c*c*l*n+3*c*l*l*i+l*l*l*o,f.y=c*c*c*t+3*c*c*l*r+3*c*l*l*a+l*l*l*s}(t,a,l,f,c,u,o,s,g/(r-1),i),n(h,m,i.x,i.y),h=i.x,m=i.y}})}var r="precision highp float;attribute vec2 aUV;varying vec2 vUV;void main(){vUV=aUV;gl_Position=vec4(mix(vec2(-1.0),vec2(1.0),aUV),0.0,1.0);}",i=new WeakMap,a={premultipliedAlpha:!1,preserveDrawingBuffer:!0,antialias:!1,depth:!1};function o(e,t){var n=e.getContext?e.getContext("webgl",a):e,r=i.get(n);if(!r){var o="undefined"!=typeof WebGL2RenderingContext&&n instanceof WebGL2RenderingContext,s={},l={},f={},c=-1,u=[];function d(e){var t=s[e];if(!t&&!(t=s[e]=n.getExtension(e)))throw Error(e+" not supported");return t}function v(e,t){var r=n.createShader(t);return n.shaderSource(r,e),n.compileShader(r),r}function p(){s={},l={},f={},c=-1,u.length=0}n.canvas.addEventListener("webglcontextlost",function(e){p(),e.preventDefault()},!1),i.set(n,r={gl:n,isWebGL2:o,getExtension:d,withProgram:function(e,t,r,i){if(!l[e]){var a={},s={},f=n.createProgram();n.attachShader(f,v(t,n.VERTEX_SHADER)),n.attachShader(f,v(r,n.FRAGMENT_SHADER)),n.linkProgram(f),l[e]={program:f,transaction:function(e){n.useProgram(f),e({setUniform:function(e,t){for(var r=[],i=arguments.length-2;i-- >0;)r[i]=arguments[i+2];var a=s[t]||(s[t]=n.getUniformLocation(f,t));n["uniform"+e].apply(n,[a].concat(r))},setAttribute:function(e,t,r,i,s){var l=a[e];l||(l=a[e]={buf:n.createBuffer(),loc:n.getAttribLocation(f,e),data:null}),n.bindBuffer(n.ARRAY_BUFFER,l.buf),n.vertexAttribPointer(l.loc,t,n.FLOAT,!1,0,0),n.enableVertexAttribArray(l.loc),o?n.vertexAttribDivisor(l.loc,i):d("ANGLE_instanced_arrays").vertexAttribDivisorANGLE(l.loc,i),s!==l.data&&(n.bufferData(n.ARRAY_BUFFER,s,r),l.data=s)}})}}}l[e].transaction(i)},withTexture:function(e,t){c++;try{n.activeTexture(n.TEXTURE0+c);var r=f[e];r||(r=f[e]=n.createTexture(),n.bindTexture(n.TEXTURE_2D,r),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_MIN_FILTER,n.NEAREST),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_MAG_FILTER,n.NEAREST)),n.bindTexture(n.TEXTURE_2D,r),t(r,c)}finally{c--}},withTextureFramebuffer:function(e,t,r){var i=n.createFramebuffer();u.push(i),n.bindFramebuffer(n.FRAMEBUFFER,i),n.activeTexture(n.TEXTURE0+t),n.bindTexture(n.TEXTURE_2D,e),n.framebufferTexture2D(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,e,0);try{r(i)}finally{n.deleteFramebuffer(i),n.bindFramebuffer(n.FRAMEBUFFER,u[--u.length-1]||null)}},handleContextLoss:p})}t(r)}function s(e,t,n,i,a,s,l,f){void 0===l&&(l=15),void 0===f&&(f=null),o(e,function(e){var o=e.gl,c=e.withProgram;(0,e.withTexture)("copy",function(e,u){o.texImage2D(o.TEXTURE_2D,0,o.RGBA,a,s,0,o.RGBA,o.UNSIGNED_BYTE,t),c("copy",r,"precision highp float;uniform sampler2D tex;varying vec2 vUV;void main(){gl_FragColor=texture2D(tex,vUV);}",function(e){var t=e.setUniform;(0,e.setAttribute)("aUV",2,o.STATIC_DRAW,0,new Float32Array([0,0,2,0,0,2])),t("1i","image",u),o.bindFramebuffer(o.FRAMEBUFFER,f||null),o.disable(o.BLEND),o.colorMask(8&l,4&l,2&l,1&l),o.viewport(n,i,a,s),o.scissor(n,i,a,s),o.drawArrays(o.TRIANGLES,0,3)})})})}var l=Object.freeze({__proto__:null,withWebGLContext:o,renderImageData:s,resizeWebGLCanvasWithoutClearing:function(e,t,n){var r=e.width,i=e.height;o(e,function(a){var o=a.gl,l=new Uint8Array(r*i*4);o.readPixels(0,0,r,i,o.RGBA,o.UNSIGNED_BYTE,l),e.width=t,e.height=n,s(o,l,0,0,r,i)})}});function f(e,t,r,i,a,o){void 0===o&&(o=1);var s=new Uint8Array(e*t),l=i[2]-i[0],f=i[3]-i[1],c=[];n(r,function(e,t,n,r){c.push({x1:e,y1:t,x2:n,y2:r,minX:Math.min(e,n),minY:Math.min(t,r),maxX:Math.max(e,n),maxY:Math.max(t,r)})}),c.sort(function(e,t){return e.maxX-t.maxX});for(var u=0;u<e;u++)for(var d=0;d<t;d++){var v=function(e,t){for(var n=1/0,r=1/0,i=c.length;i--;){var a=c[i];if(a.maxX+r<=e)break;if(e+r>a.minX&&t-r<a.maxY&&t+r>a.minY){var o=function(e,t,n,r,i,a){var o=i-n,s=a-r,l=o*o+s*s,f=l?Math.max(0,Math.min(1,((e-n)*o+(t-r)*s)/l)):0,c=e-(n+f*o),u=t-(r+f*s);return c*c+u*u}(e,t,a.x1,a.y1,a.x2,a.y2);o<n&&(r=Math.sqrt(n=o))}}return function(e,t){for(var n=0,r=c.length;r--;){var i=c[r];if(i.maxX<=e)break;i.y1>t!=i.y2>t&&e<(i.x2-i.x1)*(t-i.y1)/(i.y2-i.y1)+i.x1&&(n+=i.y1<i.y2?1:-1)}return 0!==n}(e,t)&&(r=-r),r}(i[0]+l*(u+.5)/e,i[1]+f*(d+.5)/t),p=Math.pow(1-Math.abs(v)/a,o)/2;v<0&&(p=1-p),p=Math.max(0,Math.min(255,Math.round(255*p))),s[d*e+u]=p}return s}function c(e,t,n,r,i,a,o,s,l,f){void 0===a&&(a=1),void 0===s&&(s=0),void 0===l&&(l=0),void 0===f&&(f=0),u(e,t,n,r,i,a,o,null,s,l,f)}function u(e,t,n,r,i,a,o,l,c,u,d){void 0===a&&(a=1),void 0===c&&(c=0),void 0===u&&(u=0),void 0===d&&(d=0);for(var v=f(e,t,n,r,i,a),p=new Uint8Array(4*v.length),h=0;h<v.length;h++)p[4*h+d]=v[h];s(o,p,c,u,e,t,1<<3-d,l)}var d=Object.freeze({__proto__:null,generate:f,generateIntoCanvas:c,generateIntoFramebuffer:u}),v=new Float32Array([0,0,2,0,0,2]),p=null,h=!1,m={},g=new WeakMap;function y(e){if(!h&&!_(e))throw Error("WebGL generation not supported")}function b(e,t,n,r,i,a,s){if(void 0===a&&(a=1),void 0===s&&(s=null),!s&&!(s=p)){var l="function"==typeof OffscreenCanvas?new OffscreenCanvas(1,1):"undefined"!=typeof document?document.createElement("canvas"):null;if(!l)throw Error("OffscreenCanvas or DOM canvas not supported");s=p=l.getContext("webgl",{depth:!1})}y(s);var f=new Uint8Array(e*t*4);o(s,function(o){var s=o.gl,l=o.withTexture,c=o.withTextureFramebuffer;l("readable",function(o,l){s.texImage2D(s.TEXTURE_2D,0,s.RGBA,e,t,0,s.RGBA,s.UNSIGNED_BYTE,null),c(o,l,function(o){x(e,t,n,r,i,a,s,o,0,0,0),s.readPixels(0,0,e,t,s.RGBA,s.UNSIGNED_BYTE,f)})})});for(var c=new Uint8Array(e*t),u=0,d=0;u<f.length;u+=4)c[d++]=f[u];return c}function w(e,t,n,r,i,a,o,s,l,f){void 0===a&&(a=1),void 0===s&&(s=0),void 0===l&&(l=0),void 0===f&&(f=0),x(e,t,n,r,i,a,o,null,s,l,f)}function x(e,t,i,a,s,l,f,c,u,d,p){void 0===l&&(l=1),void 0===u&&(u=0),void 0===d&&(d=0),void 0===p&&(p=0),y(f);var h=[];n(i,function(e,t,n,r){h.push(e,t,n,r)}),h=new Float32Array(h),o(f,function(n){var i=n.gl,o=n.isWebGL2,f=n.getExtension,m=n.withProgram,g=n.withTexture,y=n.withTextureFramebuffer,b=n.handleContextLoss;if(g("rawDistances",function(n,g){(e!==n._lastWidth||t!==n._lastHeight)&&i.texImage2D(i.TEXTURE_2D,0,i.RGBA,n._lastWidth=e,n._lastHeight=t,0,i.RGBA,i.UNSIGNED_BYTE,null),m("main","precision highp float;uniform vec4 uGlyphBounds;attribute vec2 aUV;attribute vec4 aLineSegment;varying vec4 vLineSegment;varying vec2 vGlyphXY;void main(){vLineSegment=aLineSegment;vGlyphXY=mix(uGlyphBounds.xy,uGlyphBounds.zw,aUV);gl_Position=vec4(mix(vec2(-1.0),vec2(1.0),aUV),0.0,1.0);}","precision highp float;uniform vec4 uGlyphBounds;uniform float uMaxDistance;uniform float uExponent;varying vec4 vLineSegment;varying vec2 vGlyphXY;float absDistToSegment(vec2 point,vec2 lineA,vec2 lineB){vec2 lineDir=lineB-lineA;float lenSq=dot(lineDir,lineDir);float t=lenSq==0.0 ? 0.0 : clamp(dot(point-lineA,lineDir)/lenSq,0.0,1.0);vec2 linePt=lineA+t*lineDir;return distance(point,linePt);}void main(){vec4 seg=vLineSegment;vec2 p=vGlyphXY;float dist=absDistToSegment(p,seg.xy,seg.zw);float val=pow(1.0-clamp(dist/uMaxDistance,0.0,1.0),uExponent)*0.5;bool crossing=(seg.y>p.y!=seg.w>p.y)&&(p.x<(seg.z-seg.x)*(p.y-seg.y)/(seg.w-seg.y)+seg.x);bool crossingUp=crossing&&vLineSegment.y<vLineSegment.w;gl_FragColor=vec4(crossingUp ? 1.0/255.0 : 0.0,crossing&&!crossingUp ? 1.0/255.0 : 0.0,0.0,val);}",function(r){var c=r.setAttribute,u=r.setUniform,d=!o&&f("ANGLE_instanced_arrays"),p=!o&&f("EXT_blend_minmax");c("aUV",2,i.STATIC_DRAW,0,v),c("aLineSegment",4,i.DYNAMIC_DRAW,1,h),u.apply(void 0,["4f","uGlyphBounds"].concat(a)),u("1f","uMaxDistance",s),u("1f","uExponent",l),y(n,g,function(n){i.enable(i.BLEND),i.colorMask(!0,!0,!0,!0),i.viewport(0,0,e,t),i.scissor(0,0,e,t),i.blendFunc(i.ONE,i.ONE),i.blendEquationSeparate(i.FUNC_ADD,o?i.MAX:p.MAX_EXT),i.clear(i.COLOR_BUFFER_BIT),o?i.drawArraysInstanced(i.TRIANGLES,0,3,h.length/4):d.drawArraysInstancedANGLE(i.TRIANGLES,0,3,h.length/4)})}),m("post",r,"precision highp float;uniform sampler2D tex;varying vec2 vUV;void main(){vec4 color=texture2D(tex,vUV);bool inside=color.r!=color.g;float val=inside ? 1.0-color.a : color.a;gl_FragColor=vec4(val);}",function(n){n.setAttribute("aUV",2,i.STATIC_DRAW,0,v),n.setUniform("1i","tex",g),i.bindFramebuffer(i.FRAMEBUFFER,c),i.disable(i.BLEND),i.colorMask(0===p,1===p,2===p,3===p),i.viewport(u,d,e,t),i.scissor(u,d,e,t),i.drawArrays(i.TRIANGLES,0,3)})}),i.isContextLost())throw b(),Error("webgl context lost")})}function _(e){var t=e&&e!==p?e.canvas||e:m,n=g.get(t);if(void 0===n){h=!0;var r=null;try{var i=[97,106,97,61,99,137,118,80,80,118,137,99,61,97,106,97],a=b(4,4,"M8,8L16,8L24,24L16,24Z",[0,0,32,32],24,1,e);(n=a&&i.length===a.length&&a.every(function(e,t){return e===i[t]}))||(r="bad trial run results",console.info(i,a))}catch(e){n=!1,r=e.message}r&&console.warn("WebGL SDF generation not supported:",r),h=!1,g.set(t,n)}return n}var E=Object.freeze({__proto__:null,generate:b,generateIntoCanvas:w,generateIntoFramebuffer:x,isSupported:_});return e.forEachPathCommand=t,e.generate=function(e,t,n,r,i,a){void 0===i&&(i=Math.max(r[2]-r[0],r[3]-r[1])/2),void 0===a&&(a=1);try{return b.apply(E,arguments)}catch(e){return console.info("WebGL SDF generation failed, falling back to JS",e),f.apply(d,arguments)}},e.generateIntoCanvas=function(e,t,n,r,i,a,o,s,l,f){void 0===i&&(i=Math.max(r[2]-r[0],r[3]-r[1])/2),void 0===a&&(a=1),void 0===s&&(s=0),void 0===l&&(l=0),void 0===f&&(f=0);try{return w.apply(E,arguments)}catch(e){return console.info("WebGL SDF generation failed, falling back to JS",e),c.apply(d,arguments)}},e.javascript=d,e.pathToLineSegments=n,e.webgl=E,e.webglUtils=l,Object.defineProperty(e,"__esModule",{value:!0}),e}({})}},5571:(e,t,n)=>{let r,i;n.d(t,{N:()=>I});var a=n(8945),o=n(2115),s=n(7720),l=n(264);let f=new s.NRn,c=new s.Pq0;class u extends s.CmU{constructor(){super(),this.isLineSegmentsGeometry=!0,this.type="LineSegmentsGeometry",this.setIndex([0,2,1,2,3,1,2,4,3,4,5,3,4,6,5,6,7,5]),this.setAttribute("position",new s.qtW([-1,2,0,1,2,0,-1,1,0,1,1,0,-1,0,0,1,0,0,-1,-1,0,1,-1,0],3)),this.setAttribute("uv",new s.qtW([-1,2,1,2,-1,1,1,1,-1,-1,1,-1,-1,-2,1,-2],2))}applyMatrix4(e){let t=this.attributes.instanceStart,n=this.attributes.instanceEnd;return void 0!==t&&(t.applyMatrix4(e),n.applyMatrix4(e),t.needsUpdate=!0),null!==this.boundingBox&&this.computeBoundingBox(),null!==this.boundingSphere&&this.computeBoundingSphere(),this}setPositions(e){let t;e instanceof Float32Array?t=e:Array.isArray(e)&&(t=new Float32Array(e));let n=new s.LuO(t,6,1);return this.setAttribute("instanceStart",new s.eHs(n,3,0)),this.setAttribute("instanceEnd",new s.eHs(n,3,3)),this.computeBoundingBox(),this.computeBoundingSphere(),this}setColors(e,t=3){let n;e instanceof Float32Array?n=e:Array.isArray(e)&&(n=new Float32Array(e));let r=new s.LuO(n,2*t,1);return this.setAttribute("instanceColorStart",new s.eHs(r,t,0)),this.setAttribute("instanceColorEnd",new s.eHs(r,t,t)),this}fromWireframeGeometry(e){return this.setPositions(e.attributes.position.array),this}fromEdgesGeometry(e){return this.setPositions(e.attributes.position.array),this}fromMesh(e){return this.fromWireframeGeometry(new s.XJ7(e.geometry)),this}fromLineSegments(e){let t=e.geometry;return this.setPositions(t.attributes.position.array),this}computeBoundingBox(){null===this.boundingBox&&(this.boundingBox=new s.NRn);let e=this.attributes.instanceStart,t=this.attributes.instanceEnd;void 0!==e&&void 0!==t&&(this.boundingBox.setFromBufferAttribute(e),f.setFromBufferAttribute(t),this.boundingBox.union(f))}computeBoundingSphere(){null===this.boundingSphere&&(this.boundingSphere=new s.iyt),null===this.boundingBox&&this.computeBoundingBox();let e=this.attributes.instanceStart,t=this.attributes.instanceEnd;if(void 0!==e&&void 0!==t){let n=this.boundingSphere.center;this.boundingBox.getCenter(n);let r=0;for(let i=0,a=e.count;i<a;i++)c.fromBufferAttribute(e,i),r=Math.max(r,n.distanceToSquared(c)),c.fromBufferAttribute(t,i),r=Math.max(r,n.distanceToSquared(c));this.boundingSphere.radius=Math.sqrt(r),isNaN(this.boundingSphere.radius)&&console.error("THREE.LineSegmentsGeometry.computeBoundingSphere(): Computed radius is NaN. The instanced position data is likely to have NaN values.",this)}}toJSON(){}applyMatrix(e){return console.warn("THREE.LineSegmentsGeometry: applyMatrix() has been renamed to applyMatrix4()."),this.applyMatrix4(e)}}var d=n(7548);let v=parseInt(s.sPf.replace(/\D+/g,""));class p extends s.BKk{constructor(e){super({type:"LineMaterial",uniforms:s.LlO.clone(s.LlO.merge([d.UniformsLib.common,d.UniformsLib.fog,{worldUnits:{value:1},linewidth:{value:1},resolution:{value:new s.I9Y(1,1)},dashOffset:{value:0},dashScale:{value:1},dashSize:{value:1},gapSize:{value:1}}])),vertexShader:`
				#include <common>
				#include <fog_pars_vertex>
				#include <logdepthbuf_pars_vertex>
				#include <clipping_planes_pars_vertex>

				uniform float linewidth;
				uniform vec2 resolution;

				attribute vec3 instanceStart;
				attribute vec3 instanceEnd;

				#ifdef USE_COLOR
					#ifdef USE_LINE_COLOR_ALPHA
						varying vec4 vLineColor;
						attribute vec4 instanceColorStart;
						attribute vec4 instanceColorEnd;
					#else
						varying vec3 vLineColor;
						attribute vec3 instanceColorStart;
						attribute vec3 instanceColorEnd;
					#endif
				#endif

				#ifdef WORLD_UNITS

					varying vec4 worldPos;
					varying vec3 worldStart;
					varying vec3 worldEnd;

					#ifdef USE_DASH

						varying vec2 vUv;

					#endif

				#else

					varying vec2 vUv;

				#endif

				#ifdef USE_DASH

					uniform float dashScale;
					attribute float instanceDistanceStart;
					attribute float instanceDistanceEnd;
					varying float vLineDistance;

				#endif

				void trimSegment( const in vec4 start, inout vec4 end ) {

					// trim end segment so it terminates between the camera plane and the near plane

					// conservative estimate of the near plane
					float a = projectionMatrix[ 2 ][ 2 ]; // 3nd entry in 3th column
					float b = projectionMatrix[ 3 ][ 2 ]; // 3nd entry in 4th column
					float nearEstimate = - 0.5 * b / a;

					float alpha = ( nearEstimate - start.z ) / ( end.z - start.z );

					end.xyz = mix( start.xyz, end.xyz, alpha );

				}

				void main() {

					#ifdef USE_COLOR

						vLineColor = ( position.y < 0.5 ) ? instanceColorStart : instanceColorEnd;

					#endif

					#ifdef USE_DASH

						vLineDistance = ( position.y < 0.5 ) ? dashScale * instanceDistanceStart : dashScale * instanceDistanceEnd;
						vUv = uv;

					#endif

					float aspect = resolution.x / resolution.y;

					// camera space
					vec4 start = modelViewMatrix * vec4( instanceStart, 1.0 );
					vec4 end = modelViewMatrix * vec4( instanceEnd, 1.0 );

					#ifdef WORLD_UNITS

						worldStart = start.xyz;
						worldEnd = end.xyz;

					#else

						vUv = uv;

					#endif

					// special case for perspective projection, and segments that terminate either in, or behind, the camera plane
					// clearly the gpu firmware has a way of addressing this issue when projecting into ndc space
					// but we need to perform ndc-space calculations in the shader, so we must address this issue directly
					// perhaps there is a more elegant solution -- WestLangley

					bool perspective = ( projectionMatrix[ 2 ][ 3 ] == - 1.0 ); // 4th entry in the 3rd column

					if ( perspective ) {

						if ( start.z < 0.0 && end.z >= 0.0 ) {

							trimSegment( start, end );

						} else if ( end.z < 0.0 && start.z >= 0.0 ) {

							trimSegment( end, start );

						}

					}

					// clip space
					vec4 clipStart = projectionMatrix * start;
					vec4 clipEnd = projectionMatrix * end;

					// ndc space
					vec3 ndcStart = clipStart.xyz / clipStart.w;
					vec3 ndcEnd = clipEnd.xyz / clipEnd.w;

					// direction
					vec2 dir = ndcEnd.xy - ndcStart.xy;

					// account for clip-space aspect ratio
					dir.x *= aspect;
					dir = normalize( dir );

					#ifdef WORLD_UNITS

						// get the offset direction as perpendicular to the view vector
						vec3 worldDir = normalize( end.xyz - start.xyz );
						vec3 offset;
						if ( position.y < 0.5 ) {

							offset = normalize( cross( start.xyz, worldDir ) );

						} else {

							offset = normalize( cross( end.xyz, worldDir ) );

						}

						// sign flip
						if ( position.x < 0.0 ) offset *= - 1.0;

						float forwardOffset = dot( worldDir, vec3( 0.0, 0.0, 1.0 ) );

						// don't extend the line if we're rendering dashes because we
						// won't be rendering the endcaps
						#ifndef USE_DASH

							// extend the line bounds to encompass  endcaps
							start.xyz += - worldDir * linewidth * 0.5;
							end.xyz += worldDir * linewidth * 0.5;

							// shift the position of the quad so it hugs the forward edge of the line
							offset.xy -= dir * forwardOffset;
							offset.z += 0.5;

						#endif

						// endcaps
						if ( position.y > 1.0 || position.y < 0.0 ) {

							offset.xy += dir * 2.0 * forwardOffset;

						}

						// adjust for linewidth
						offset *= linewidth * 0.5;

						// set the world position
						worldPos = ( position.y < 0.5 ) ? start : end;
						worldPos.xyz += offset;

						// project the worldpos
						vec4 clip = projectionMatrix * worldPos;

						// shift the depth of the projected points so the line
						// segments overlap neatly
						vec3 clipPose = ( position.y < 0.5 ) ? ndcStart : ndcEnd;
						clip.z = clipPose.z * clip.w;

					#else

						vec2 offset = vec2( dir.y, - dir.x );
						// undo aspect ratio adjustment
						dir.x /= aspect;
						offset.x /= aspect;

						// sign flip
						if ( position.x < 0.0 ) offset *= - 1.0;

						// endcaps
						if ( position.y < 0.0 ) {

							offset += - dir;

						} else if ( position.y > 1.0 ) {

							offset += dir;

						}

						// adjust for linewidth
						offset *= linewidth;

						// adjust for clip-space to screen-space conversion // maybe resolution should be based on viewport ...
						offset /= resolution.y;

						// select end
						vec4 clip = ( position.y < 0.5 ) ? clipStart : clipEnd;

						// back to clip space
						offset *= clip.w;

						clip.xy += offset;

					#endif

					gl_Position = clip;

					vec4 mvPosition = ( position.y < 0.5 ) ? start : end; // this is an approximation

					#include <logdepthbuf_vertex>
					#include <clipping_planes_vertex>
					#include <fog_vertex>

				}
			`,fragmentShader:`
				uniform vec3 diffuse;
				uniform float opacity;
				uniform float linewidth;

				#ifdef USE_DASH

					uniform float dashOffset;
					uniform float dashSize;
					uniform float gapSize;

				#endif

				varying float vLineDistance;

				#ifdef WORLD_UNITS

					varying vec4 worldPos;
					varying vec3 worldStart;
					varying vec3 worldEnd;

					#ifdef USE_DASH

						varying vec2 vUv;

					#endif

				#else

					varying vec2 vUv;

				#endif

				#include <common>
				#include <fog_pars_fragment>
				#include <logdepthbuf_pars_fragment>
				#include <clipping_planes_pars_fragment>

				#ifdef USE_COLOR
					#ifdef USE_LINE_COLOR_ALPHA
						varying vec4 vLineColor;
					#else
						varying vec3 vLineColor;
					#endif
				#endif

				vec2 closestLineToLine(vec3 p1, vec3 p2, vec3 p3, vec3 p4) {

					float mua;
					float mub;

					vec3 p13 = p1 - p3;
					vec3 p43 = p4 - p3;

					vec3 p21 = p2 - p1;

					float d1343 = dot( p13, p43 );
					float d4321 = dot( p43, p21 );
					float d1321 = dot( p13, p21 );
					float d4343 = dot( p43, p43 );
					float d2121 = dot( p21, p21 );

					float denom = d2121 * d4343 - d4321 * d4321;

					float numer = d1343 * d4321 - d1321 * d4343;

					mua = numer / denom;
					mua = clamp( mua, 0.0, 1.0 );
					mub = ( d1343 + d4321 * ( mua ) ) / d4343;
					mub = clamp( mub, 0.0, 1.0 );

					return vec2( mua, mub );

				}

				void main() {

					#include <clipping_planes_fragment>

					#ifdef USE_DASH

						if ( vUv.y < - 1.0 || vUv.y > 1.0 ) discard; // discard endcaps

						if ( mod( vLineDistance + dashOffset, dashSize + gapSize ) > dashSize ) discard; // todo - FIX

					#endif

					float alpha = opacity;

					#ifdef WORLD_UNITS

						// Find the closest points on the view ray and the line segment
						vec3 rayEnd = normalize( worldPos.xyz ) * 1e5;
						vec3 lineDir = worldEnd - worldStart;
						vec2 params = closestLineToLine( worldStart, worldEnd, vec3( 0.0, 0.0, 0.0 ), rayEnd );

						vec3 p1 = worldStart + lineDir * params.x;
						vec3 p2 = rayEnd * params.y;
						vec3 delta = p1 - p2;
						float len = length( delta );
						float norm = len / linewidth;

						#ifndef USE_DASH

							#ifdef USE_ALPHA_TO_COVERAGE

								float dnorm = fwidth( norm );
								alpha = 1.0 - smoothstep( 0.5 - dnorm, 0.5 + dnorm, norm );

							#else

								if ( norm > 0.5 ) {

									discard;

								}

							#endif

						#endif

					#else

						#ifdef USE_ALPHA_TO_COVERAGE

							// artifacts appear on some hardware if a derivative is taken within a conditional
							float a = vUv.x;
							float b = ( vUv.y > 0.0 ) ? vUv.y - 1.0 : vUv.y + 1.0;
							float len2 = a * a + b * b;
							float dlen = fwidth( len2 );

							if ( abs( vUv.y ) > 1.0 ) {

								alpha = 1.0 - smoothstep( 1.0 - dlen, 1.0 + dlen, len2 );

							}

						#else

							if ( abs( vUv.y ) > 1.0 ) {

								float a = vUv.x;
								float b = ( vUv.y > 0.0 ) ? vUv.y - 1.0 : vUv.y + 1.0;
								float len2 = a * a + b * b;

								if ( len2 > 1.0 ) discard;

							}

						#endif

					#endif

					vec4 diffuseColor = vec4( diffuse, alpha );
					#ifdef USE_COLOR
						#ifdef USE_LINE_COLOR_ALPHA
							diffuseColor *= vLineColor;
						#else
							diffuseColor.rgb *= vLineColor;
						#endif
					#endif

					#include <logdepthbuf_fragment>

					gl_FragColor = diffuseColor;

					#include <tonemapping_fragment>
					#include <${v>=154?"colorspace_fragment":"encodings_fragment"}>
					#include <fog_fragment>
					#include <premultiplied_alpha_fragment>

				}
			`,clipping:!0}),this.isLineMaterial=!0,this.onBeforeCompile=function(){this.transparent?this.defines.USE_LINE_COLOR_ALPHA="1":delete this.defines.USE_LINE_COLOR_ALPHA},Object.defineProperties(this,{color:{enumerable:!0,get:function(){return this.uniforms.diffuse.value},set:function(e){this.uniforms.diffuse.value=e}},worldUnits:{enumerable:!0,get:function(){return"WORLD_UNITS"in this.defines},set:function(e){!0===e?this.defines.WORLD_UNITS="":delete this.defines.WORLD_UNITS}},linewidth:{enumerable:!0,get:function(){return this.uniforms.linewidth.value},set:function(e){this.uniforms.linewidth.value=e}},dashed:{enumerable:!0,get:function(){return"USE_DASH"in this.defines},set(e){!!e!="USE_DASH"in this.defines&&(this.needsUpdate=!0),!0===e?this.defines.USE_DASH="":delete this.defines.USE_DASH}},dashScale:{enumerable:!0,get:function(){return this.uniforms.dashScale.value},set:function(e){this.uniforms.dashScale.value=e}},dashSize:{enumerable:!0,get:function(){return this.uniforms.dashSize.value},set:function(e){this.uniforms.dashSize.value=e}},dashOffset:{enumerable:!0,get:function(){return this.uniforms.dashOffset.value},set:function(e){this.uniforms.dashOffset.value=e}},gapSize:{enumerable:!0,get:function(){return this.uniforms.gapSize.value},set:function(e){this.uniforms.gapSize.value=e}},opacity:{enumerable:!0,get:function(){return this.uniforms.opacity.value},set:function(e){this.uniforms.opacity.value=e}},resolution:{enumerable:!0,get:function(){return this.uniforms.resolution.value},set:function(e){this.uniforms.resolution.value.copy(e)}},alphaToCoverage:{enumerable:!0,get:function(){return"USE_ALPHA_TO_COVERAGE"in this.defines},set:function(e){!!e!="USE_ALPHA_TO_COVERAGE"in this.defines&&(this.needsUpdate=!0),!0===e?(this.defines.USE_ALPHA_TO_COVERAGE="",this.extensions.derivatives=!0):(delete this.defines.USE_ALPHA_TO_COVERAGE,this.extensions.derivatives=!1)}}}),this.setValues(e)}}let h=v>=125?"uv1":"uv2",m=new s.IUQ,g=new s.Pq0,y=new s.Pq0,b=new s.IUQ,w=new s.IUQ,x=new s.IUQ,_=new s.Pq0,E=new s.kn4,S=new s.cZY,A=new s.Pq0,M=new s.NRn,L=new s.iyt,D=new s.IUQ;function T(e,t,n){return D.set(0,0,-t,1).applyMatrix4(e.projectionMatrix),D.multiplyScalar(1/D.w),D.x=i/n.width,D.y=i/n.height,D.applyMatrix4(e.projectionMatrixInverse),D.multiplyScalar(1/D.w),Math.abs(Math.max(D.x,D.y))}class U extends s.eaF{constructor(e=new u,t=new p({color:0xffffff*Math.random()})){super(e,t),this.isLineSegments2=!0,this.type="LineSegments2"}computeLineDistances(){let e=this.geometry,t=e.attributes.instanceStart,n=e.attributes.instanceEnd,r=new Float32Array(2*t.count);for(let e=0,i=0,a=t.count;e<a;e++,i+=2)g.fromBufferAttribute(t,e),y.fromBufferAttribute(n,e),r[i]=0===i?0:r[i-1],r[i+1]=r[i]+g.distanceTo(y);let i=new s.LuO(r,2,1);return e.setAttribute("instanceDistanceStart",new s.eHs(i,1,0)),e.setAttribute("instanceDistanceEnd",new s.eHs(i,1,1)),this}raycast(e,t){let n,a,o=this.material.worldUnits,l=e.camera;null!==l||o||console.error('LineSegments2: "Raycaster.camera" needs to be set in order to raycast against LineSegments2 while worldUnits is set to false.');let f=void 0!==e.params.Line2&&e.params.Line2.threshold||0;r=e.ray;let c=this.matrixWorld,u=this.geometry,d=this.material;if(i=d.linewidth+f,null===u.boundingSphere&&u.computeBoundingSphere(),L.copy(u.boundingSphere).applyMatrix4(c),o)n=.5*i;else{let e=Math.max(l.near,L.distanceToPoint(r.origin));n=T(l,e,d.resolution)}if(L.radius+=n,!1!==r.intersectsSphere(L)){if(null===u.boundingBox&&u.computeBoundingBox(),M.copy(u.boundingBox).applyMatrix4(c),o)a=.5*i;else{let e=Math.max(l.near,M.distanceToPoint(r.origin));a=T(l,e,d.resolution)}M.expandByScalar(a),!1!==r.intersectsBox(M)&&(o?function(e,t){let n=e.matrixWorld,a=e.geometry,o=a.attributes.instanceStart,l=a.attributes.instanceEnd,f=Math.min(a.instanceCount,o.count);for(let a=0;a<f;a++){S.start.fromBufferAttribute(o,a),S.end.fromBufferAttribute(l,a),S.applyMatrix4(n);let f=new s.Pq0,c=new s.Pq0;r.distanceSqToSegment(S.start,S.end,c,f),c.distanceTo(f)<.5*i&&t.push({point:c,pointOnLine:f,distance:r.origin.distanceTo(c),object:e,face:null,faceIndex:a,uv:null,[h]:null})}}(this,t):function(e,t,n){let a=t.projectionMatrix,o=e.material.resolution,l=e.matrixWorld,f=e.geometry,c=f.attributes.instanceStart,u=f.attributes.instanceEnd,d=Math.min(f.instanceCount,c.count),v=-t.near;r.at(1,x),x.w=1,x.applyMatrix4(t.matrixWorldInverse),x.applyMatrix4(a),x.multiplyScalar(1/x.w),x.x*=o.x/2,x.y*=o.y/2,x.z=0,_.copy(x),E.multiplyMatrices(t.matrixWorldInverse,l);for(let t=0;t<d;t++){if(b.fromBufferAttribute(c,t),w.fromBufferAttribute(u,t),b.w=1,w.w=1,b.applyMatrix4(E),w.applyMatrix4(E),b.z>v&&w.z>v)continue;if(b.z>v){let e=b.z-w.z,t=(b.z-v)/e;b.lerp(w,t)}else if(w.z>v){let e=w.z-b.z,t=(w.z-v)/e;w.lerp(b,t)}b.applyMatrix4(a),w.applyMatrix4(a),b.multiplyScalar(1/b.w),w.multiplyScalar(1/w.w),b.x*=o.x/2,b.y*=o.y/2,w.x*=o.x/2,w.y*=o.y/2,S.start.copy(b),S.start.z=0,S.end.copy(w),S.end.z=0;let f=S.closestPointToPointParameter(_,!0);S.at(f,A);let d=s.cj9.lerp(b.z,w.z,f),p=d>=-1&&d<=1,m=_.distanceTo(A)<.5*i;if(p&&m){S.start.fromBufferAttribute(c,t),S.end.fromBufferAttribute(u,t),S.start.applyMatrix4(l),S.end.applyMatrix4(l);let i=new s.Pq0,a=new s.Pq0;r.distanceSqToSegment(S.start,S.end,a,i),n.push({point:a,pointOnLine:i,distance:r.origin.distanceTo(a),object:e,face:null,faceIndex:t,uv:null,[h]:null})}}}(this,l,t))}}onBeforeRender(e){let t=this.material.uniforms;t&&t.resolution&&(e.getViewport(m),this.material.uniforms.resolution.value.set(m.z,m.w))}}class R extends u{constructor(){super(),this.isLineGeometry=!0,this.type="LineGeometry"}setPositions(e){let t=e.length-3,n=new Float32Array(2*t);for(let r=0;r<t;r+=3)n[2*r]=e[r],n[2*r+1]=e[r+1],n[2*r+2]=e[r+2],n[2*r+3]=e[r+3],n[2*r+4]=e[r+4],n[2*r+5]=e[r+5];return super.setPositions(n),this}setColors(e,t=3){let n=e.length-t,r=new Float32Array(2*n);if(3===t)for(let i=0;i<n;i+=t)r[2*i]=e[i],r[2*i+1]=e[i+1],r[2*i+2]=e[i+2],r[2*i+3]=e[i+3],r[2*i+4]=e[i+4],r[2*i+5]=e[i+5];else for(let i=0;i<n;i+=t)r[2*i]=e[i],r[2*i+1]=e[i+1],r[2*i+2]=e[i+2],r[2*i+3]=e[i+3],r[2*i+4]=e[i+4],r[2*i+5]=e[i+5],r[2*i+6]=e[i+6],r[2*i+7]=e[i+7];return super.setColors(r,t),this}fromLine(e){let t=e.geometry;return this.setPositions(t.attributes.position.array),this}}class k extends U{constructor(e=new R,t=new p({color:0xffffff*Math.random()})){super(e,t),this.isLine2=!0,this.type="Line2"}}let I=o.forwardRef(function({points:e,color:t=0xffffff,vertexColors:n,linewidth:r,lineWidth:i,segments:f,dashed:c,...d},v){var h,m;let g=(0,l.C)(e=>e.size),y=o.useMemo(()=>f?new U:new k,[f]),[b]=o.useState(()=>new p),w=(null==n||null==(h=n[0])?void 0:h.length)===4?4:3,x=o.useMemo(()=>{let r=f?new u:new R,i=e.map(e=>{let t=Array.isArray(e);return e instanceof s.Pq0||e instanceof s.IUQ?[e.x,e.y,e.z]:e instanceof s.I9Y?[e.x,e.y,0]:t&&3===e.length?[e[0],e[1],e[2]]:t&&2===e.length?[e[0],e[1],0]:e});if(r.setPositions(i.flat()),n){t=0xffffff;let e=n.map(e=>e instanceof s.Q1f?e.toArray():e);r.setColors(e.flat(),w)}return r},[e,f,n,w]);return o.useLayoutEffect(()=>{y.computeLineDistances()},[e,y]),o.useLayoutEffect(()=>{c?b.defines.USE_DASH="":delete b.defines.USE_DASH,b.needsUpdate=!0},[c,b]),o.useEffect(()=>()=>{x.dispose(),b.dispose()},[x]),o.createElement("primitive",(0,a.A)({object:y,ref:v},d),o.createElement("primitive",{object:x,attach:"geometry"}),o.createElement("primitive",(0,a.A)({object:b,attach:"material",color:t,vertexColors:!!n,resolution:[g.width,g.height],linewidth:null!=(m=null!=r?r:i)?m:1,dashed:c,transparent:4===w},d)))})},6923:(e,t,n)=>{n.d(t,{E:()=>l});var r=n(8945),i=n(2115),a=n(4785),o=n(264),s=n(3689);let l=i.forwardRef(({sdfGlyphSize:e=64,anchorX:t="center",anchorY:n="middle",font:l,fontSize:f=1,children:c,characters:u,onSync:d,...v},p)=>{let h=(0,o.C)(({invalidate:e})=>e),[m]=i.useState(()=>new a.EY),[g,y]=i.useMemo(()=>{let e=[],t="";return i.Children.forEach(c,n=>{"string"==typeof n||"number"==typeof n?t+=n:e.push(n)}),[e,t]},[c]);return(0,s.DY)(()=>new Promise(e=>(0,a.PY)({font:l,characters:u},e)),["troika-text",l,u]),i.useLayoutEffect(()=>void m.sync(()=>{h(),d&&d(m)})),i.useEffect(()=>()=>m.dispose(),[m]),i.createElement("primitive",(0,r.A)({object:m,ref:p,font:l,text:y,anchorX:t,anchorY:n,fontSize:f,sdfGlyphSize:e},v),g)})},7509:(e,t,n)=>{n.d(t,{A:()=>r});let r=function(){return function(e){var t,n,r,i,a={R:"13k,1a,2,3,3,2+1j,ch+16,a+1,5+2,2+n,5,a,4,6+16,4+3,h+1b,4mo,179q,2+9,2+11,2i9+7y,2+68,4,3+4,5+13,4+3,2+4k,3+29,8+cf,1t+7z,w+17,3+3m,1t+3z,16o1+5r,8+30,8+mc,29+1r,29+4v,75+73",EN:"1c+9,3d+1,6,187+9,513,4+5,7+9,sf+j,175h+9,qw+q,161f+1d,4xt+a,25i+9",ES:"17,2,6dp+1,f+1,av,16vr,mx+1,4o,2",ET:"z+2,3h+3,b+1,ym,3e+1,2o,p4+1,8,6u,7c,g6,1wc,1n9+4,30+1b,2n,6d,qhx+1,h0m,a+1,49+2,63+1,4+1,6bb+3,12jj",AN:"16o+5,2j+9,2+1,35,ed,1ff2+9,87+u",CS:"18,2+1,b,2u,12k,55v,l,17v0,2,3,53,2+1,b",B:"a,3,f+2,2v,690",S:"9,2,k",WS:"c,k,4f4,1vk+a,u,1j,335",ON:"x+1,4+4,h+5,r+5,r+3,z,5+3,2+1,2+1,5,2+2,3+4,o,w,ci+1,8+d,3+d,6+8,2+g,39+1,9,6+1,2,33,b8,3+1,3c+1,7+1,5r,b,7h+3,sa+5,2,3i+6,jg+3,ur+9,2v,ij+1,9g+9,7+a,8m,4+1,49+x,14u,2+2,c+2,e+2,e+2,e+1,i+n,e+e,2+p,u+2,e+2,36+1,2+3,2+1,b,2+2,6+5,2,2,2,h+1,5+4,6+3,3+f,16+2,5+3l,3+81,1y+p,2+40,q+a,m+13,2r+ch,2+9e,75+hf,3+v,2+2w,6e+5,f+6,75+2a,1a+p,2+2g,d+5x,r+b,6+3,4+o,g,6+1,6+2,2k+1,4,2j,5h+z,1m+1,1e+f,t+2,1f+e,d+3,4o+3,2s+1,w,535+1r,h3l+1i,93+2,2s,b+1,3l+x,2v,4g+3,21+3,kz+1,g5v+1,5a,j+9,n+v,2,3,2+8,2+1,3+2,2,3,46+1,4+4,h+5,r+5,r+a,3h+2,4+6,b+4,78,1r+24,4+c,4,1hb,ey+6,103+j,16j+c,1ux+7,5+g,fsh,jdq+1t,4,57+2e,p1,1m,1m,1m,1m,4kt+1,7j+17,5+2r,d+e,3+e,2+e,2+10,m+4,w,1n+5,1q,4z+5,4b+rb,9+c,4+c,4+37,d+2g,8+b,l+b,5+1j,9+9,7+13,9+t,3+1,27+3c,2+29,2+3q,d+d,3+4,4+2,6+6,a+o,8+6,a+2,e+6,16+42,2+1i",BN:"0+8,6+d,2s+5,2+p,e,4m9,1kt+2,2b+5,5+5,17q9+v,7k,6p+8,6+1,119d+3,440+7,96s+1,1ekf+1,1ekf+1,1ekf+1,1ekf+1,1ekf+1,1ekf+1,1ekf+1,1ekf+1,1ekf+1,1ekf+1,1ekf+1,1ekf+75,6p+2rz,1ben+1,1ekf+1,1ekf+1",NSM:"lc+33,7o+6,7c+18,2,2+1,2+1,2,21+a,1d+k,h,2u+6,3+5,3+1,2+3,10,v+q,2k+a,1n+8,a,p+3,2+8,2+2,2+4,18+2,3c+e,2+v,1k,2,5+7,5,4+6,b+1,u,1n,5+3,9,l+1,r,3+1,1m,5+1,5+1,3+2,4,v+1,4,c+1,1m,5+4,2+1,5,l+1,n+5,2,1n,3,2+3,9,8+1,c+1,v,1q,d,1f,4,1m+2,6+2,2+3,8+1,c+1,u,1n,g+1,l+1,t+1,1m+1,5+3,9,l+1,u,21,8+2,2,2j,3+6,d+7,2r,3+8,c+5,23+1,s,2,2,1k+d,2+4,2+1,6+a,2+z,a,2v+3,2+5,2+1,3+1,q+1,5+2,h+3,e,3+1,7,g,jk+2,qb+2,u+2,u+1,v+1,1t+1,2+6,9,3+a,a,1a+2,3c+1,z,3b+2,5+1,a,7+2,64+1,3,1n,2+6,2,2,3+7,7+9,3,1d+g,1s+3,1d,2+4,2,6,15+8,d+1,x+3,3+1,2+2,1l,2+1,4,2+2,1n+7,3+1,49+2,2+c,2+6,5,7,4+1,5j+1l,2+4,k1+w,2db+2,3y,2p+v,ff+3,30+1,n9x+3,2+9,x+1,29+1,7l,4,5,q+1,6,48+1,r+h,e,13+7,q+a,1b+2,1d,3+3,3+1,14,1w+5,3+1,3+1,d,9,1c,1g,2+2,3+1,6+1,2,17+1,9,6n,3,5,fn5,ki+f,h+f,r2,6b,46+4,1af+2,2+1,6+3,15+2,5,4m+1,fy+3,as+1,4a+a,4x,1j+e,1l+2,1e+3,3+1,1y+2,11+4,2+7,1r,d+1,1h+8,b+3,3,2o+2,3,2+1,7,4h,4+7,m+1,1m+1,4,12+6,4+4,5g+7,3+2,2,o,2d+5,2,5+1,2+1,6n+3,7+1,2+1,s+1,2e+7,3,2+1,2z,2,3+5,2,2u+2,3+3,2+4,78+8,2+1,75+1,2,5,41+3,3+1,5,x+5,3+1,15+5,3+3,9,a+5,3+2,1b+c,2+1,bb+6,2+5,2d+l,3+6,2+1,2+1,3f+5,4,2+1,2+6,2,21+1,4,2,9o+1,f0c+4,1o+6,t5,1s+3,2a,f5l+1,43t+2,i+7,3+6,v+3,45+2,1j0+1i,5+1d,9,f,n+4,2+e,11t+6,2+g,3+6,2+1,2+4,7a+6,c6+3,15t+6,32+6,gzhy+6n",AL:"16w,3,2,e+1b,z+2,2+2s,g+1,8+1,b+m,2+t,s+2i,c+e,4h+f,1d+1e,1bwe+dp,3+3z,x+c,2+1,35+3y,2rm+z,5+7,b+5,dt+l,c+u,17nl+27,1t+27,4x+6n,3+d",LRO:"6ct",RLO:"6cu",LRE:"6cq",RLE:"6cr",PDF:"6cs",LRI:"6ee",RLI:"6ef",FSI:"6eg",PDI:"6eh"},o={},s={};o.L=1,s[1]="L",Object.keys(a).forEach(function(e,t){o[e]=1<<t+1,s[o[e]]=e}),Object.freeze(o);var l=o.LRI|o.RLI|o.FSI,f=o.L|o.R|o.AL,c=o.B|o.S|o.WS|o.ON|o.FSI|o.LRI|o.RLI|o.PDI,u=o.BN|o.RLE|o.LRE|o.RLO|o.LRO|o.PDF,d=o.S|o.WS|o.B|l|o.PDI|u,v=null;function p(e){if(!v){v=new Map;var t=function(e){if(a.hasOwnProperty(e)){var t=0;a[e].split(",").forEach(function(n){var r=n.split("+"),i=r[0],a=r[1];i=parseInt(i,36),a=a?parseInt(a,36):0,v.set(t+=i,o[e]);for(var s=0;s<a;s++)v.set(++t,o[e])})}};for(var n in a)t(n)}return v.get(e.codePointAt(0))||o.L}function h(e,t){var n,r=0,i=new Map,a=t&&new Map;return e.split(",").forEach(function e(o){if(-1!==o.indexOf("+"))for(var s=+o;s--;)e(n);else{n=o;var l=o.split(">"),f=l[0],c=l[1];f=String.fromCodePoint(r+=parseInt(f,36)),c=String.fromCodePoint(r+=parseInt(c,36)),i.set(f,c),t&&a.set(c,f)}}),{map:i,reverseMap:a}}function m(){if(!t){var e=h("14>1,1e>2,u>2,2wt>1,1>1,1ge>1,1wp>1,1j>1,f>1,hm>1,1>1,u>1,u6>1,1>1,+5,28>1,w>1,1>1,+3,b8>1,1>1,+3,1>3,-1>-1,3>1,1>1,+2,1s>1,1>1,x>1,th>1,1>1,+2,db>1,1>1,+3,3>1,1>1,+2,14qm>1,1>1,+1,4q>1,1e>2,u>2,2>1,+1",!0),i=e.map,a=e.reverseMap;t=i,n=a,r=h("6f1>-6dx,6dy>-6dx,6ec>-6ed,6ee>-6ed,6ww>2jj,-2ji>2jj,14r4>-1e7l,1e7m>-1e7l,1e7m>-1e5c,1e5d>-1e5b,1e5c>-14qx,14qy>-14qx,14vn>-1ecg,1ech>-1ecg,1edu>-1ecg,1eci>-1ecg,1eda>-1ecg,1eci>-1ecg,1eci>-168q,168r>-168q,168s>-14ye,14yf>-14ye",!1).map}}function g(e){return m(),t.get(e)||null}function y(e){return m(),n.get(e)||null}function b(e){return m(),r.get(e)||null}var w=o.L,x=o.R,_=o.EN,E=o.ES,S=o.ET,A=o.AN,M=o.CS,L=o.B,D=o.S,T=o.ON,U=o.BN,R=o.NSM,k=o.AL,I=o.LRO,B=o.RLO,C=o.LRE,z=o.RLE,O=o.PDF,P=o.LRI,j=o.RLI,N=o.FSI,F=o.PDI;function q(e){if(!i){var t=h("14>1,j>2,t>2,u>2,1a>g,2v3>1,1>1,1ge>1,1wd>1,b>1,1j>1,f>1,ai>3,-2>3,+1,8>1k0,-1jq>1y7,-1y6>1hf,-1he>1h6,-1h5>1ha,-1h8>1qi,-1pu>1,6>3u,-3s>7,6>1,1>1,f>1,1>1,+2,3>1,1>1,+13,4>1,1>1,6>1eo,-1ee>1,3>1mg,-1me>1mk,-1mj>1mi,-1mg>1mi,-1md>1,1>1,+2,1>10k,-103>1,1>1,4>1,5>1,1>1,+10,3>1,1>8,-7>8,+1,-6>7,+1,a>1,1>1,u>1,u6>1,1>1,+5,26>1,1>1,2>1,2>2,8>1,7>1,4>1,1>1,+5,b8>1,1>1,+3,1>3,-2>1,2>1,1>1,+2,c>1,3>1,1>1,+2,h>1,3>1,a>1,1>1,2>1,3>1,1>1,d>1,f>1,3>1,1a>1,1>1,6>1,7>1,13>1,k>1,1>1,+19,4>1,1>1,+2,2>1,1>1,+18,m>1,a>1,1>1,lk>1,1>1,4>1,2>1,f>1,3>1,1>1,+3,db>1,1>1,+3,3>1,1>1,+2,14qm>1,1>1,+1,6>1,4j>1,j>2,t>2,u>2,2>1,+1",!0),n=t.map;t.reverseMap.forEach(function(e,t){n.set(t,e)}),i=n}return i.get(e)||null}function G(e,t,n,r){var i=e.length;n=Math.max(0,null==n?0:+n),r=Math.min(i-1,null==r?i-1:+r);var a=[];return t.paragraphs.forEach(function(i){var o=Math.max(n,i.start),s=Math.min(r,i.end);if(o<s){for(var l=t.levels.slice(o,s+1),f=s;f>=o&&p(e[f])&d;f--)l[f]=i.level;for(var c=i.level,u=1/0,v=0;v<l.length;v++){var h=l[v];h>c&&(c=h),h<u&&(u=1|h)}for(var m=c;m>=u;m--)for(var g=0;g<l.length;g++)if(l[g]>=m){for(var y=g;g+1<l.length&&l[g+1]>=m;)g++;g>y&&a.push([y+o,g+o])}}}),a}function W(e,t,n,r){for(var i=G(e,t,n,r),a=[],o=0;o<e.length;o++)a[o]=o;return i.forEach(function(e){for(var t=e[0],n=e[1],r=a.slice(t,n+1),i=r.length;i--;)a[n-i]=r[i]}),a}return e.closingToOpeningBracket=y,e.getBidiCharType=p,e.getBidiCharTypeName=function(e){return s[p(e)]},e.getCanonicalBracket=b,e.getEmbeddingLevels=function(e,t){for(var n=new Uint32Array(e.length),r=0;r<e.length;r++)n[r]=p(e[r]);var i=new Map;function a(e,t){var r=n[e];n[e]=t,i.set(r,i.get(r)-1),r&c&&i.set(c,i.get(c)-1),i.set(t,(i.get(t)||0)+1),t&c&&i.set(c,(i.get(c)||0)+1)}for(var o=new Uint8Array(e.length),s=new Map,v=[],h=null,m=0;m<e.length;m++)h||v.push(h={start:m,end:e.length-1,level:"rtl"===t?1:"ltr"===t?0:tU(m,!1)}),n[m]&L&&(h.end=m,h=null);for(var q=z|C|B|I|l|F|O|L,G=function(e){return e+(1&e?1:2)},W=function(e){return e+(1&e?2:1)},H=0;H<v.length;H++){var $=[{_level:(h=v[H]).level,_override:0,_isolate:0}],V=void 0,X=0,Y=0,Q=0;i.clear();for(var K=h.start;K<=h.end;K++){var J=n[K];if(V=$[$.length-1],i.set(J,(i.get(J)||0)+1),J&c&&i.set(c,(i.get(c)||0)+1),J&q)if(J&(z|C)){o[K]=V._level;var Z=(J===z?W:G)(V._level);!(Z<=125)||X||Y?!X&&Y++:$.push({_level:Z,_override:0,_isolate:0})}else if(J&(B|I)){o[K]=V._level;var ee=(J===B?W:G)(V._level);!(ee<=125)||X||Y?!X&&Y++:$.push({_level:ee,_override:J&B?x:w,_isolate:0})}else if(J&l){J&N&&(J=1===tU(K+1,!0)?j:P),o[K]=V._level,V._override&&a(K,V._override);var et=(J===j?W:G)(V._level);et<=125&&0===X&&0===Y?(Q++,$.push({_level:et,_override:0,_isolate:1,_isolInitIndex:K})):X++}else if(J&F){if(X>0)X--;else if(Q>0){for(Y=0;!$[$.length-1]._isolate;)$.pop();var en=$[$.length-1]._isolInitIndex;null!=en&&(s.set(en,K),s.set(K,en)),$.pop(),Q--}V=$[$.length-1],o[K]=V._level,V._override&&a(K,V._override)}else J&O?(0===X&&(Y>0?Y--:!V._isolate&&$.length>1&&($.pop(),V=$[$.length-1])),o[K]=V._level):J&L&&(o[K]=h.level);else o[K]=V._level,V._override&&J!==U&&a(K,V._override)}for(var er=[],ei=null,ea=h.start;ea<=h.end;ea++){var eo=n[ea];if(!(eo&u)){var es=o[ea],el=eo&l,ef=eo===F;ei&&es===ei._level?(ei._end=ea,ei._endsWithIsolInit=el):er.push(ei={_start:ea,_end:ea,_level:es,_startsWithPDI:ef,_endsWithIsolInit:el})}}for(var ec=[],eu=0;eu<er.length;eu++){var ed=er[eu];if(!ed._startsWithPDI||ed._startsWithPDI&&!s.has(ed._start)){for(var ev=[ei=ed],ep=void 0;ei&&ei._endsWithIsolInit&&null!=(ep=s.get(ei._end));)for(var eh=eu+1;eh<er.length;eh++)if(er[eh]._start===ep){ev.push(ei=er[eh]);break}for(var em=[],eg=0;eg<ev.length;eg++)for(var ey=ev[eg],eb=ey._start;eb<=ey._end;eb++)em.push(eb);for(var ew=o[em[0]],ex=h.level,e_=em[0]-1;e_>=0;e_--)if(!(n[e_]&u)){ex=o[e_];break}var eE=em[em.length-1],eS=o[eE],eA=h.level;if(!(n[eE]&l)){for(var eM=eE+1;eM<=h.end;eM++)if(!(n[eM]&u)){eA=o[eM];break}}ec.push({_seqIndices:em,_sosType:Math.max(ex,ew)%2?x:w,_eosType:Math.max(eA,eS)%2?x:w})}}for(var eL=0;eL<ec.length;eL++){var eD=ec[eL],eT=eD._seqIndices,eU=eD._sosType,eR=eD._eosType,ek=1&o[eT[0]]?x:w;if(i.get(R))for(var eI=0;eI<eT.length;eI++){var eB=eT[eI];if(n[eB]&R){for(var eC=eU,ez=eI-1;ez>=0;ez--)if(!(n[eT[ez]]&u)){eC=n[eT[ez]];break}a(eB,eC&(l|F)?T:eC)}}if(i.get(_))for(var eO=0;eO<eT.length;eO++){var eP=eT[eO];if(n[eP]&_)for(var ej=eO-1;ej>=-1;ej--){var eN=-1===ej?eU:n[eT[ej]];if(eN&f){eN===k&&a(eP,A);break}}}if(i.get(k))for(var eF=0;eF<eT.length;eF++){var eq=eT[eF];n[eq]&k&&a(eq,x)}if(i.get(E)||i.get(M))for(var eG=1;eG<eT.length-1;eG++){var eW=eT[eG];if(n[eW]&(E|M)){for(var eH=0,e$=0,eV=eG-1;eV>=0&&(eH=n[eT[eV]])&u;eV--);for(var eX=eG+1;eX<eT.length&&(e$=n[eT[eX]])&u;eX++);eH===e$&&(n[eW]===E?eH===_:eH&(_|A))&&a(eW,eH)}}if(i.get(_)){for(var eY=0;eY<eT.length;eY++)if(n[eT[eY]]&_){for(var eQ=eY-1;eQ>=0&&n[eT[eQ]]&(S|u);eQ--)a(eT[eQ],_);for(eY++;eY<eT.length&&n[eT[eY]]&(S|u|_);eY++)n[eT[eY]]!==_&&a(eT[eY],_)}}if(i.get(S)||i.get(E)||i.get(M))for(var eK=0;eK<eT.length;eK++){var eJ=eT[eK];if(n[eJ]&(S|E|M)){a(eJ,T);for(var eZ=eK-1;eZ>=0&&n[eT[eZ]]&u;eZ--)a(eT[eZ],T);for(var e1=eK+1;e1<eT.length&&n[eT[e1]]&u;e1++)a(eT[e1],T)}}if(i.get(_))for(var e0=0,e2=eU;e0<eT.length;e0++){var e3=eT[e0],e4=n[e3];e4&_?e2===w&&a(e3,w):e4&f&&(e2=e4)}if(i.get(c)){for(var e5=x|_|A,e6=e5|w,e7=[],e8=[],e9=0;e9<eT.length;e9++)if(n[eT[e9]]&c){var te=e[eT[e9]],tt=void 0;if(null!==g(te))if(e8.length<63)e8.push({char:te,seqIndex:e9});else break;else if(null!==(tt=y(te)))for(var tn=e8.length-1;tn>=0;tn--){var tr=e8[tn].char;if(tr===tt||tr===y(b(te))||g(b(tr))===te){e7.push([e8[tn].seqIndex,e9]),e8.length=tn;break}}}e7.sort(function(e,t){return e[0]-t[0]});for(var ti=0;ti<e7.length;ti++){for(var ta=e7[ti],to=ta[0],ts=ta[1],tl=!1,tf=0,tc=to+1;tc<ts;tc++){var tu=eT[tc];if(n[tu]&e6){tl=!0;var td=n[tu]&e5?x:w;if(td===ek){tf=td;break}}}if(tl&&!tf){tf=eU;for(var tv=to-1;tv>=0;tv--){var tp=eT[tv];if(n[tp]&e6){var th=n[tp]&e5?x:w;tf=th!==ek?th:ek;break}}}if(tf){if(n[eT[to]]=n[eT[ts]]=tf,tf!==ek){for(var tm=to+1;tm<eT.length;tm++)if(!(n[eT[tm]]&u)){p(e[eT[tm]])&R&&(n[eT[tm]]=tf);break}}if(tf!==ek){for(var tg=ts+1;tg<eT.length;tg++)if(!(n[eT[tg]]&u)){p(e[eT[tg]])&R&&(n[eT[tg]]=tf);break}}}}for(var ty=0;ty<eT.length;ty++)if(n[eT[ty]]&c){for(var tb=ty,tw=ty,tx=eU,t_=ty-1;t_>=0;t_--)if(n[eT[t_]]&u)tb=t_;else{tx=n[eT[t_]]&e5?x:w;break}for(var tE=eR,tS=ty+1;tS<eT.length;tS++)if(n[eT[tS]]&(c|u))tw=tS;else{tE=n[eT[tS]]&e5?x:w;break}for(var tA=tb;tA<=tw;tA++)n[eT[tA]]=tx===tE?tx:ek;ty=tw}}}for(var tM=h.start;tM<=h.end;tM++){var tL=o[tM],tD=n[tM];if(1&tL?tD&(w|_|A)&&o[tM]++:tD&x?o[tM]++:tD&(A|_)&&(o[tM]+=2),tD&u&&(o[tM]=0===tM?h.level:o[tM-1]),tM===h.end||p(e[tM])&(D|L))for(var tT=tM;tT>=0&&p(e[tT])&d;tT--)o[tT]=h.level}}return{levels:o,paragraphs:v};function tU(t,r){for(var i=t;i<e.length;i++){var a=n[i];if(a&(x|k))return 1;if(a&(L|w)||r&&a===F)break;if(a&l){var o=function(t){for(var r=1,i=t+1;i<e.length;i++){var a=n[i];if(a&L)break;if(a&F){if(0==--r)return i}else a&l&&r++}return -1}(i);i=-1===o?e.length:o}}return 0}},e.getMirroredCharacter=q,e.getMirroredCharactersMap=function(e,t,n,r){var i=e.length;n=Math.max(0,null==n?0:+n),r=Math.min(i-1,null==r?i-1:+r);for(var a=new Map,o=n;o<=r;o++)if(1&t[o]){var s=q(e[o]);null!==s&&a.set(o,s)}return a},e.getReorderSegments=G,e.getReorderedIndices=W,e.getReorderedString=function(e,t,n,r){var i=W(e,t,n,r),a=[].concat(e);return i.forEach(function(n,r){a[r]=(1&t.levels[n]?q(e[n]):null)||e[n]}),a.join("")},e.openingToClosingBracket=g,Object.defineProperty(e,"__esModule",{value:!0}),e}({})}},7771:(e,t,n)=>{n.d(t,{Do:()=>a,Fh:()=>v});var r=n(7548),i=n(7720);let a=/\bvoid\s+main\s*\(\s*\)\s*{/g;function o(e){return e.replace(/^[ \t]*#include +<([\w\d./]+)>/gm,function(e,t){let n=r.ShaderChunk[t];return n?o(n):e})}let s=[];for(let e=0;e<256;e++)s[e]=(e<16?"0":"")+e.toString(16);let l=Object.assign||function(){let e=arguments[0];for(let t=1,n=arguments.length;t<n;t++){let n=arguments[t];if(n)for(let t in n)Object.prototype.hasOwnProperty.call(n,t)&&(e[t]=n[t])}return e},f=Date.now(),c=new WeakMap,u=new Map,d=1e10;function v(e,t){let n=function(e){let t=JSON.stringify(e,h),n=g.get(t);return null==n&&g.set(t,n=++m),n}(t),r=c.get(e);if(r||c.set(e,r=Object.create(null)),r[n])return new r[n];let a=`_onBeforeCompile${n}`,y=function(r,i){e.onBeforeCompile.call(this,r,i);let s=this.customProgramCacheKey()+"|"+r.vertexShader+"|"+r.fragmentShader,c=u[s];if(!c){let e=function(e,{vertexShader:t,fragmentShader:n},r,i){let{vertexDefs:a,vertexMainIntro:s,vertexMainOutro:l,vertexTransform:f,fragmentDefs:c,fragmentMainIntro:u,fragmentMainOutro:d,fragmentColorTransform:v,customRewriter:h,timeUniform:m}=r;if(a=a||"",s=s||"",l=l||"",c=c||"",u=u||"",d=d||"",(f||h)&&(t=o(t)),(v||h)&&(n=o(n=n.replace(/^[ \t]*#include <((?:tonemapping|encodings|colorspace|fog|premultiplied_alpha|dithering)_fragment)>/gm,"\n//!BEGIN_POST_CHUNK $1\n$&\n//!END_POST_CHUNK\n"))),h){let e=h({vertexShader:t,fragmentShader:n});t=e.vertexShader,n=e.fragmentShader}if(v){let e=[];n=n.replace(/^\/\/!BEGIN_POST_CHUNK[^]+?^\/\/!END_POST_CHUNK/gm,t=>(e.push(t),"")),d=`${v}
${e.join("\n")}
${d}`}if(m){let e=`
uniform float ${m};
`;a=e+a,c=e+c}return f&&(t=`vec3 troika_position_${i};
vec3 troika_normal_${i};
vec2 troika_uv_${i};
${t}
`,a=`${a}
void troikaVertexTransform${i}(inout vec3 position, inout vec3 normal, inout vec2 uv) {
  ${f}
}
`,s=`
troika_position_${i} = vec3(position);
troika_normal_${i} = vec3(normal);
troika_uv_${i} = vec2(uv);
troikaVertexTransform${i}(troika_position_${i}, troika_normal_${i}, troika_uv_${i});
${s}
`,t=t.replace(/\b(position|normal|uv)\b/g,(e,t,n,r)=>/\battribute\s+vec[23]\s+$/.test(r.substr(0,n))?t:`troika_${t}_${i}`),e.map&&e.map.channel>0||(t=t.replace(/\bMAP_UV\b/g,`troika_uv_${i}`))),{vertexShader:t=p(t,i,a,s,l),fragmentShader:n=p(n,i,c,u,d)}}(this,r,t,n);c=u[s]=e}r.vertexShader=c.vertexShader,r.fragmentShader=c.fragmentShader,l(r.uniforms,this.uniforms),t.timeUniform&&(r.uniforms[t.timeUniform]={get value(){return Date.now()-f}}),this[a]&&this[a](r)},b=function(){return w(t.chained?e:e.clone())},w=function(r){let i=Object.create(r,x);return Object.defineProperty(i,"baseMaterial",{value:e}),Object.defineProperty(i,"id",{value:d++}),i.uuid=function(){let e=0xffffffff*Math.random()|0,t=0xffffffff*Math.random()|0,n=0xffffffff*Math.random()|0,r=0xffffffff*Math.random()|0;return(s[255&e]+s[e>>8&255]+s[e>>16&255]+s[e>>24&255]+"-"+s[255&t]+s[t>>8&255]+"-"+s[t>>16&15|64]+s[t>>24&255]+"-"+s[63&n|128]+s[n>>8&255]+"-"+s[n>>16&255]+s[n>>24&255]+s[255&r]+s[r>>8&255]+s[r>>16&255]+s[r>>24&255]).toUpperCase()}(),i.uniforms=l({},r.uniforms,t.uniforms),i.defines=l({},r.defines,t.defines),i.defines[`TROIKA_DERIVED_MATERIAL_${n}`]="",i.extensions=l({},r.extensions,t.extensions),i._listeners=void 0,i},x={constructor:{value:b},isDerivedMaterial:{value:!0},type:{get:()=>e.type,set:t=>{e.type=t}},isDerivedFrom:{writable:!0,configurable:!0,value:function(e){let t=this.baseMaterial;return e===t||t.isDerivedMaterial&&t.isDerivedFrom(e)||!1}},customProgramCacheKey:{writable:!0,configurable:!0,value:function(){return e.customProgramCacheKey()+"|"+n}},onBeforeCompile:{get:()=>y,set(e){this[a]=e}},copy:{writable:!0,configurable:!0,value:function(t){return e.copy.call(this,t),e.isShaderMaterial||e.isDerivedMaterial||(l(this.extensions,t.extensions),l(this.defines,t.defines),l(this.uniforms,i.LlO.clone(t.uniforms))),this}},clone:{writable:!0,configurable:!0,value:function(){return w(new e.constructor).copy(this)}},getDepthMaterial:{writable:!0,configurable:!0,value:function(){let n=this._depthMaterial;return n||((n=this._depthMaterial=v(e.isDerivedMaterial?e.getDepthMaterial():new i.CSG({depthPacking:i.N5j}),t)).defines.IS_DEPTH_MATERIAL="",n.uniforms=this.uniforms),n}},getDistanceMaterial:{writable:!0,configurable:!0,value:function(){let n=this._distanceMaterial;return n||((n=this._distanceMaterial=v(e.isDerivedMaterial?e.getDistanceMaterial():new i.aVO,t)).defines.IS_DISTANCE_MATERIAL="",n.uniforms=this.uniforms),n}},dispose:{writable:!0,configurable:!0,value(){let{_depthMaterial:t,_distanceMaterial:n}=this;t&&t.dispose(),n&&n.dispose(),e.dispose.call(this)}}};return r[n]=b,new b}function p(e,t,n,r,i){return(r||i||n)&&(e=e.replace(a,`
${n}
void troikaOrigMain${t}() {`)+`
void main() {
  ${r}
  troikaOrigMain${t}();
  ${i}
}`),e}function h(e,t){return"uniforms"===e?void 0:"function"==typeof t?t.toString():t}let m=0,g=new Map,y=`
uniform vec3 pointA;
uniform vec3 controlA;
uniform vec3 controlB;
uniform vec3 pointB;
uniform float radius;
varying float bezierT;

vec3 cubicBezier(vec3 p1, vec3 c1, vec3 c2, vec3 p2, float t) {
  float t2 = 1.0 - t;
  float b0 = t2 * t2 * t2;
  float b1 = 3.0 * t * t2 * t2;
  float b2 = 3.0 * t * t * t2;
  float b3 = t * t * t;
  return b0 * p1 + b1 * c1 + b2 * c2 + b3 * p2;
}

vec3 cubicBezierDerivative(vec3 p1, vec3 c1, vec3 c2, vec3 p2, float t) {
  float t2 = 1.0 - t;
  return -3.0 * p1 * t2 * t2 +
    c1 * (3.0 * t2 * t2 - 6.0 * t2 * t) +
    c2 * (6.0 * t2 * t - 3.0 * t * t) +
    3.0 * p2 * t * t;
}
`,b=`
float t = position.y;
bezierT = t;
vec3 bezierCenterPos = cubicBezier(pointA, controlA, controlB, pointB, t);
vec3 bezierDir = normalize(cubicBezierDerivative(pointA, controlA, controlB, pointB, t));

// Make "sideways" always perpendicular to the camera ray; this ensures that any twists
// in the cylinder occur where you won't see them: 
vec3 viewDirection = normalMatrix * vec3(0.0, 0.0, 1.0);
if (bezierDir == viewDirection) {
  bezierDir = normalize(cubicBezierDerivative(pointA, controlA, controlB, pointB, t == 1.0 ? t - 0.0001 : t + 0.0001));
}
vec3 sideways = normalize(cross(bezierDir, viewDirection));
vec3 upish = normalize(cross(sideways, bezierDir));

// Build a matrix for transforming this disc in the cylinder:
mat4 discTx;
discTx[0].xyz = sideways * radius;
discTx[1].xyz = bezierDir * radius;
discTx[2].xyz = upish * radius;
discTx[3].xyz = bezierCenterPos;
discTx[3][3] = 1.0;

// Apply transform, ignoring original y
position = (discTx * vec4(position.x, 0.0, position.z, 1.0)).xyz;
normal = normalize(mat3(discTx) * normal);
`,w=`
uniform vec3 dashing;
varying float bezierT;
`,x=`
if (dashing.x + dashing.y > 0.0) {
  float dashFrac = mod(bezierT - dashing.z, dashing.x + dashing.y);
  if (dashFrac > dashing.x) {
    discard;
  }
}
`,_=null,E=new i._4j({color:0xffffff,side:i.$EB});class S extends i.eaF{static getGeometry(){return _||(_=new i.Ho_(1,1,1,6,64).translate(0,.5,0))}constructor(){super(S.getGeometry(),E),this.pointA=new i.Pq0,this.controlA=new i.Pq0,this.controlB=new i.Pq0,this.pointB=new i.Pq0,this.radius=.01,this.dashArray=new i.I9Y,this.dashOffset=0,this.frustumCulled=!1}get material(){let e=this._derivedMaterial,t=this._baseMaterial||this._defaultMaterial||(this._defaultMaterial=E.clone());return e&&e.baseMaterial===t||(e=this._derivedMaterial=v(t,{chained:!0,uniforms:{pointA:{value:new i.Pq0},controlA:{value:new i.Pq0},controlB:{value:new i.Pq0},pointB:{value:new i.Pq0},radius:{value:.01},dashing:{value:new i.Pq0}},vertexDefs:y,vertexTransform:b,fragmentDefs:w,fragmentMainIntro:x}),t.addEventListener("dispose",function n(){t.removeEventListener("dispose",n),e.dispose()})),e}set material(e){this._baseMaterial=e}get customDepthMaterial(){return this.material.getDepthMaterial()}set customDepthMaterial(e){}get customDistanceMaterial(){return this.material.getDistanceMaterial()}set customDistanceMaterial(e){}onBeforeRender(){let{uniforms:e}=this.material,{pointA:t,controlA:n,controlB:r,pointB:i,radius:a,dashArray:o,dashOffset:s}=this;e.pointA.value.copy(t),e.controlA.value.copy(n),e.controlB.value.copy(r),e.pointB.value.copy(i),e.radius.value=a,e.dashing.value.set(o.x,o.y,s||0)}raycast(){}}},9905:(e,t,n)=>{function r(){var e=Object.create(null);function t(e,t){var n=void 0;self.troikaDefine=function(e){return n=e};var r=URL.createObjectURL(new Blob(["/** "+e.replace(/\*/g,"")+" **/\n\ntroikaDefine(\n"+t+"\n)"],{type:"application/javascript"}));try{importScripts(r)}catch(e){console.error(e)}return URL.revokeObjectURL(r),delete self.troikaDefine,n}self.addEventListener("message",function(n){var r=n.data,i=r.messageId,a=r.action,o=r.data;try{"registerModule"===a&&function n(r,i){var a=r.id,o=r.name,s=r.dependencies;void 0===s&&(s=[]);var l=r.init;void 0===l&&(l=function(){});var f=r.getTransferables;if(void 0===f&&(f=null),!e[a])try{s=s.map(function(t){return t&&t.isWorkerModule&&(n(t,function(e){if(e instanceof Error)throw e}),t=e[t.id].value),t}),l=t("<"+o+">.init",l),f&&(f=t("<"+o+">.getTransferables",f));var c=null;"function"==typeof l?c=l.apply(void 0,s):console.error("worker module init function failed to rehydrate"),e[a]={id:a,value:c,getTransferables:f},i(c)}catch(e){e&&e.noLog||console.error(e),i(e)}}(o,function(e){e instanceof Error?postMessage({messageId:i,success:!1,error:e.message}):postMessage({messageId:i,success:!0,result:{isCallable:"function"==typeof e}})}),"callModule"===a&&function(t,n){var r,i=t.id,a=t.args;e[i]&&"function"==typeof e[i].value||n(Error("Worker module "+i+": not found or its 'init' did not return a function"));try{var o=(r=e[i]).value.apply(r,a);o&&"function"==typeof o.then?o.then(s,function(e){return n(e instanceof Error?e:Error(""+e))}):s(o)}catch(e){n(e)}function s(t){try{var r=e[i].getTransferables&&e[i].getTransferables(t);r&&Array.isArray(r)&&r.length||(r=void 0),n(t,r)}catch(e){console.error(e),n(e)}}}(o,function(e,t){e instanceof Error?postMessage({messageId:i,success:!1,error:e.message}):postMessage({messageId:i,success:!0,result:e},t||void 0)})}catch(e){postMessage({messageId:i,success:!1,error:e.stack})}})}n.d(t,{Qw:()=>u,kl:()=>function e(t){if((!t||"function"!=typeof t.init)&&!s)throw Error("requires `options.init` function");var n,r=t.dependencies,o=t.init,l=t.getTransferables,c=t.workerId,u=((n=function(){for(var e=[],t=arguments.length;t--;)e[t]=arguments[t];return n._getInitResult().then(function(t){if("function"==typeof t)return t.apply(void 0,e);throw Error("Worker module function was called but `init` did not return a callable function")})})._getInitResult=function(){var e=t.dependencies,r=t.init,i=Promise.all(e=Array.isArray(e)?e.map(function(e){return e&&(e=e.onMainThread||e)._getInitResult&&(e=e._getInitResult()),e}):[]).then(function(e){return r.apply(null,e)});return n._getInitResult=function(){return i},i},n);null==c&&(c="#default");var p="workerModule"+ ++a,h=t.name||p,m=null;function g(){for(var e=[],t=arguments.length;t--;)e[t]=arguments[t];if(!i())return u.apply(void 0,e);if(!m){m=v(c,"registerModule",g.workerModuleData);var n=function(){m=null,f[c].delete(n)};(f[c]||(f[c]=new Set)).add(n)}return m.then(function(t){if(t.isCallable)return v(c,"callModule",{id:p,args:e});throw Error("Worker module function was called but `init` did not return a callable function")})}return r=r&&r.map(function(t){return"function"!=typeof t||t.workerModuleData||(s=!0,t=e({workerId:c,name:"<"+h+"> function dependency: "+t.name,init:"function(){return (\n"+d(t)+"\n)}"}),s=!1),t&&t.workerModuleData&&(t=t.workerModuleData),t}),g.workerModuleData={isWorkerModule:!0,id:p,name:h,dependencies:r,init:d(o),getTransferables:l&&d(l)},g.onMainThread=u,g}}),n(5704);var i=function(){var e=!1;if("undefined"!=typeof window&&void 0!==window.document)try{new Worker(URL.createObjectURL(new Blob([""],{type:"application/javascript"}))).terminate(),e=!0}catch(e){console.log("Troika createWorkerModule: web workers not allowed; falling back to main thread execution. Cause: ["+e.message+"]")}return i=function(){return e},e},a=0,o=0,s=!1,l=Object.create(null),f=Object.create(null),c=Object.create(null);function u(e){f[e]&&f[e].forEach(function(e){e()}),l[e]&&(l[e].terminate(),delete l[e])}function d(e){var t=e.toString();return!/^function/.test(t)&&/^\w+\s*\(/.test(t)&&(t="function "+t),t}function v(e,t,n){return new Promise(function(i,a){var s=++o;c[s]=function(e){e.success?i(e.result):a(Error("Error in worker "+t+" call: "+e.error))},(function(e){var t=l[e];if(!t){var n=d(r);(t=l[e]=new Worker(URL.createObjectURL(new Blob(["/** Worker Module Bootstrap: "+e.replace(/\*/g,"")+" **/\n\n;("+n+")()"],{type:"application/javascript"})))).onmessage=function(e){var t=e.data,n=t.messageId,r=c[n];if(!r)throw Error("WorkerModule response with empty or unknown messageId");delete c[n],r(t)}}return t})(e).postMessage({messageId:s,action:t,data:n})})}}}]);