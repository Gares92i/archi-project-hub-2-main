
// This file enhances the types from @types/fabric

import { fabric as FabricNamespace } from 'fabric';

declare global {
  namespace fabric {
    export import Canvas = FabricNamespace.Canvas;
    export import Object = FabricNamespace.Object;
    export import IEvent = FabricNamespace.IEvent;
    export import Point = FabricNamespace.Point;
    export import Group = FabricNamespace.Group;
    export import Circle = FabricNamespace.Circle;
    export import Text = FabricNamespace.Text;
    export import Image = FabricNamespace.Image;
  }
}

export {};
