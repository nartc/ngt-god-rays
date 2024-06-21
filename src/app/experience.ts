import {
  CUSTOM_ELEMENTS_SCHEMA,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  viewChild,
} from "@angular/core";
import { NgtArgs, NgtCanvas, extend, injectBeforeRender } from "angular-three";
import {
  NgtpEffectComposer,
  NgtpEffects,
  NgtpGodRays,
} from "angular-three-postprocessing";
import { BlendFunction, KernelSize } from "postprocessing";
import * as THREE from "three";
import { Mesh } from "three";

extend(THREE);

@Component({
  selector: "app-knot",
  standalone: true,
  template: `
    <ngt-mesh #knot>
      <ngt-torus-knot-geometry *args="[4, 0.4, 256, 64, 2, 5]" />
      <ngt-mesh-physical-material
        color="#FFFFFF"
        [roughness]="0"
        [metalness]="0"
        [clearcoat]="1"
      />
    </ngt-mesh>
  `,
  imports: [NgtArgs],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Knot {
  knot = viewChild.required<ElementRef<Mesh>>("knot");

  constructor() {
    injectBeforeRender(() => {
      const { nativeElement } = this.knot();
      nativeElement.rotation.y += -0.01;
      nativeElement.rotation.z += -0.01;
    });
  }
}

@Component({
  selector: "app-sun",
  standalone: true,
  template: `
    <ngt-mesh #sun [position]="[0, 0, -15]">
      <ngt-sphere-geometry *args="[1, 36, 36]" />
      <ngt-mesh-basic-material color="#00ff00" />
    </ngt-mesh>
  `,
  imports: [NgtArgs],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Sun {
  sunRef = viewChild.required<ElementRef<Mesh>>("sun");

  constructor() {
    injectBeforeRender(({ clock }) => {
      const { nativeElement } = this.sunRef();
      nativeElement.position.x = Math.sin(clock.getElapsedTime()) * -8;
      nativeElement.position.y = Math.cos(clock.getElapsedTime()) * -8;
    });
  }
}

@Component({
  standalone: true,
  template: `
    <ngt-color *args="['#171717']" attach="background" />
    <ngt-point-light
      [position]="[15, 15, 15]"
      [intensity]="Math.PI"
      [decay]="0"
    />

    <app-knot />
    <app-sun />

    <ngtp-effect-composer [options]="{ multisampling: 0 }">
      <ng-template effects>
        @if (godRaysOptions(); as options) {
          <ngtp-god-rays [options]="options" />
        }
      </ng-template>
    </ngtp-effect-composer>
  `,
  imports: [Knot, Sun, NgtArgs, NgtpEffectComposer, NgtpEffects, NgtpGodRays],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "experience-scene" },
})
export class Scene {
  Math = Math;
  sun = viewChild.required(Sun);
  godRaysOptions = computed(() => {
    const sun = this.sun().sunRef().nativeElement;
    if (!sun) return null;
    return {
      sun,
      blendFunction: BlendFunction.SCREEN,
      kernelSize: KernelSize.SMALL,
      samples: 30,
      // NOTE: enable each option to see the effect
      // density: 0.97,
      // decay: 0.96,
      // weight: 0.6,
      // exposure: 0.4,
      // clampMax: 1,
      // blur: true,
    };
  });
}

@Component({
  selector: "app-experience",
  standalone: true,
  template: `
    <ngt-canvas [sceneGraph]="scene" [camera]="{ position: [0, 0, 10] }" />
  `,
  imports: [NgtCanvas],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host {
      display: block;
      height: 100dvh;
    }
  `,
})
export class Experience {
  scene = Scene;
}
