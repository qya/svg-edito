# SVG Layer Editor — Product Requirements Document

## 1. Product Overview

Build a professional SVG editor inspired by the editing experience of Adobe Photoshop,
Figma, and Illustrator, but designed specifically around SVG.

The fundamental design principle is:

> Every editable SVG object is represented as a layer.

Paths are the primary editable primitive.

An imported SVG should be parsed into a document model where SVG elements such as
`<path>`, `<rect>`, `<circle>`, `<ellipse>`, `<line>`, `<polygon>`, `<polyline>`,
`<text>`, `<g>`, and images can be represented as editable layers.

The path editor should be heavily inspired by:

https://github.com/Yqnn/svg-path-editor

However, this project is not simply a fork of a path editor.

The goal is to build a complete SVG design application around a powerful path editing
engine.

---

# 2. Product Vision

Create an SVG editor that feels like:

- Photoshop for SVG
- Figma for vector graphics
- Illustrator for path manipulation

while maintaining SVG as the native document format.

The application should make it possible to:

1. Open an existing SVG.
2. Parse its elements.
3. Convert supported elements into editable layers.
4. Select individual layers.
5. Edit their geometry visually.
6. Edit path nodes and Bézier handles.
7. Transform layers.
8. Reorder layers.
9. Hide/show layers.
10. Lock/unlock layers.
11. Duplicate layers.
12. Group layers.
13. Change fill and stroke.
14. Export back to clean SVG.

---

# 3. Core Concept

## 3.1 SVG is the source format

The editor should preserve SVG semantics whenever possible.

Example:

```svg
<svg viewBox="0 0 512 512">
  <path
    d="M10 10 L100 10 L100 100 Z"
    fill="#000000"
  />
</svg>
````

Internally this becomes:

```text
Document
└── Layer: Path
    ├── geometry
    │   └── path commands
    ├── fill
    ├── stroke
    ├── transform
    └── metadata
```

The `d` attribute remains the authoritative serialized representation of the path.

---

# 4. Design Principles

## 4.1 Path First

Paths are the most important primitive.

The editor must provide first-class support for:

* Move
* Line
* Horizontal line
* Vertical line
* Cubic Bézier
* Smooth cubic Bézier
* Quadratic Bézier
* Smooth quadratic Bézier
* Arc
* Close path

Both absolute and relative commands must be supported.

---

## 4.2 Everything is a Layer

Every editable object should appear in the Layers panel.

Example:

```text
Layers

▼ Logo
  ├── Background
  ├── Circle
  ├── Path 3
  ├── Path 2
  └── Path 1
```

A layer should have:

* ID
* Name
* Type
* Visibility
* Lock state
* Opacity
* Transform
* Geometry
* Appearance
* Parent/group
* Z-index

---

# 5. Main UI

The application should use a familiar creative application layout.

```text
┌──────────────────────────────────────────────────────────────┐
│ Menu / Toolbar                                               │
├────────────┬──────────────────────────────────────┬───────────┤
│            │                                      │           │
│  Tools     │                                      │  Layers   │
│            │                                      │           │
│  Select    │              Canvas                  │  Objects  │
│  Node      │                                      │           │
│  Pen       │                                      │           │
│  Rectangle │                                      │           │
│  Ellipse   │                                      │           │
│  Text      │                                      │           │
│            │                                      │           │
│            │                                      │           │
├────────────┴──────────────────────────────────────┴───────────┤
│ Properties / Inspector                                        │
└──────────────────────────────────────────────────────────────┘
```

---

# 6. Toolbar

## Selection

* Select tool
* Direct selection / Node tool

## Drawing

* Pen
* Pencil
* Rectangle
* Rounded rectangle
* Ellipse
* Line
* Polygon
* Polyline

## Editing

* Transform
* Hand/Pan
* Zoom

## Future

* Text
* Gradient
* Brush
* Boolean operations

---

# 7. Canvas

The canvas is the primary workspace.

Requirements:

* Infinite/pannable workspace
* Zoom in/out
* Fit to screen
* Pixel grid
* Optional grid snapping
* Optional object snapping
* Rulers
* Guides
* Selection bounding boxes
* Transform handles
* Node handles
* Bézier handles
* Rotation handles

Canvas must render the actual SVG representation rather than a simplified preview.

---

# 8. SVG Import

Users can:

* Open `.svg`
* Drag & drop SVG
* Paste SVG source
* Import from clipboard

Parser must recognize:

```text
<svg>
<g>
<path>
<rect>
<circle>
<ellipse>
<line>
<polygon>
<polyline>
<text>
<image>
<defs>
<use>
```

---

# 9. SVG → Layer Conversion

When importing SVG:

```text
SVG
│
├── Group
│   ├── Path
│   ├── Path
│   └── Circle
│
└── Path
```

becomes:

```text
Layers
│
├── Group
│   ├── Path
│   ├── Path
│   └── Circle
│
└── Path
```

The hierarchy must be preserved.

---

# 10. Path Layer

A Path Layer contains:

```ts
interface PathLayer {
  id: string
  name: string

  type: "path"

  geometry: PathGeometry

  fill: Fill
  stroke: Stroke

  opacity: number

  transform: Transform

  visible: boolean
  locked: boolean

  parentId?: string
}
```

---

# 11. Path Geometry

Do NOT treat `d` as an opaque string internally.

The application should parse it into structured commands.

Example:

```svg
M10 10
C20 20 40 20 50 10
L100 100
Z
```

becomes:

```ts
[
  {
    type: "M",
    x: 10,
    y: 10
  },
  {
    type: "C",
    x1: 20,
    y1: 20,
    x2: 40,
    y2: 20,
    x: 50,
    y: 10
  },
  {
    type: "L",
    x: 100,
    y: 100
  },
  {
    type: "Z"
  }
]
```

The renderer generates the final SVG `d` string from this model.

---

# 12. Path Editor

The path editor should be based heavily on the interaction model of:

[https://github.com/Yqnn/svg-path-editor](https://github.com/Yqnn/svg-path-editor)

Important functionality:

### Node manipulation

* Select node
* Multi-select nodes
* Drag node
* Delete node
* Add node
* Move node numerically
* Snap node to grid

### Bézier handles

* Display control handles
* Drag control handles
* Break handles
* Join handles
* Symmetric handles
* Smooth handles
* Convert node type

### Command editing

Each command can be:

* Selected
* Deleted
* Inserted
* Converted
* Reordered
* Reversed

---

# 13. Path Command Inspector

When a node/command is selected, show its properties.

Example:

```text
Cubic Bézier

X       120
Y       200

Control 1
X       90
Y       140

Control 2
X       150
Y       140
```

For an arc:

```text
Arc

RX              40
RY              40
Rotation        0
Large Arc       false
Sweep           true
X               200
Y               200
```

---

# 14. Raw Path Editor

Users should be able to edit the raw `d` value.

Example:

```text
Path Data

M 10 10
C 20 20 40 20 50 10
L 100 100
Z
```

Changes must immediately update:

* Canvas
* Nodes
* Layer preview

Invalid path data must display a validation error instead of destroying the document.

---

# 15. Path Optimization

Provide optional path optimization.

Inspired by svg-path-editor:

* Remove redundant commands
* Convert commands
* Convert relative → absolute
* Convert absolute → relative
* Remove unnecessary decimals
* Merge compatible commands
* Remove useless segments

Optimization must be non-destructive.

---

# 16. Layer Panel

The Layers panel is one of the most important components.

Each row:

```text
[eye] [lock] [thumbnail] Path 1
```

Actions:

* Select
* Rename
* Delete
* Duplicate
* Hide
* Lock
* Reorder
* Group
* Ungroup

Drag and drop should change z-order.

---

# 17. Layer Types

Initial supported layer types:

```text
Path
Rectangle
Circle
Ellipse
Line
Polygon
Polyline
Text
Group
Image
```

Internally, primitive shapes may optionally be converted into paths.

Example:

```text
Circle
   ↓ Convert to Path

Path
```

The original shape should be preserved until the user explicitly converts it.

---

# 18. Shape → Path

Provide:

```text
Convert to Path
```

Example:

```svg
<circle cx="100" cy="100" r="50"/>
```

becomes a path representation.

This allows users to edit the shape using the node editor.

---

# 19. Transform System

Every layer must support:

* X
* Y
* Width
* Height
* Rotation
* Scale X
* Scale Y
* Skew X
* Skew Y

Transform controls:

```text
┌──────────────┐
│              │
│    OBJECT    │
│              │
└──────────────┘
      ↻
```

Support:

* Resize
* Rotate
* Move
* Scale
* Skew
* Transform origin

---

# 20. Fill

Supported initially:

### Solid

```text
#000000
rgba(...)
```

### None

```text
fill="none"
```

Future:

* Linear gradient
* Radial gradient
* Pattern

---

# 21. Stroke

Properties:

```text
Color
Width
Opacity
Linecap
Linejoin
Miterlimit
Dash
Dash offset
```

Line caps:

```text
butt
round
square
```

Line joins:

```text
miter
round
bevel
```

---

# 22. Inspector

Selecting a layer opens an inspector.

Example:

```text
Path

Name
Logo Shape

Transform

X       120
Y       80
W       400
H       300
Rotation 0°

Appearance

Fill    #000000
Stroke  None
Opacity 100%

Path

Commands 12
Length   483.22
```

---

# 23. Multi-selection

Users must be able to select multiple layers.

Supported operations:

* Move
* Scale
* Rotate
* Delete
* Duplicate
* Group
* Align
* Distribute

---

# 24. Alignment

Provide:

```text
Align Left
Align Center
Align Right

Align Top
Align Middle
Align Bottom

Distribute Horizontally
Distribute Vertically
```

---

# 25. Grouping

Groups should behave like SVG `<g>`.

Example:

```text
Group
├── Path
├── Path
└── Circle
```

Group transforms should preserve child transforms.

---

# 26. Boolean Operations

Future feature.

Operations:

```text
Union
Subtract
Intersect
Exclude
Divide
```

Example:

```text
Path A + Path B
        ↓
      Union
        ↓
   Combined Path
```

Boolean operations should produce valid editable paths.

---

# 27. Undo / Redo

Everything that modifies the document must be undoable.

Examples:

* Move node
* Delete node
* Add node
* Change path command
* Change fill
* Change stroke
* Transform layer
* Rename layer
* Reorder layer
* Group
* Ungroup
* Delete layer

Keyboard:

```text
Cmd/Ctrl + Z
Cmd/Ctrl + Shift + Z
```

History should be transaction-based.

Dragging a node continuously should result in one undo operation, not hundreds.

---

# 28. Clipboard

Support:

```text
Copy
Cut
Paste
Duplicate
```

Copying a layer should preserve:

* Geometry
* Appearance
* Transform
* Metadata

Copy/paste SVG should support interoperability with external applications.

---

# 29. SVG Export

Export should produce valid SVG.

Example:

```svg
<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 512 512"
>
  <path
    d="..."
    fill="#000"
  />
</svg>
```

Export requirements:

* Preserve viewBox
* Preserve layers/groups
* Preserve transforms
* Preserve fill
* Preserve stroke
* Preserve opacity
* Preserve IDs where possible
* Remove editor-only metadata unless requested

---

# 30. Native Project Format

Optional project format:

```text
.project.svg
```

or:

```text
.project.json
```

The preferred direction is to keep SVG as the primary source format.

If application-specific metadata is required, use namespaced SVG metadata or a sidecar
project format.

---

# 31. Document Model

Suggested architecture:

```text
Document
│
├── metadata
│
├── viewport
│
├── defs
│
└── layers
    │
    ├── Layer
    ├── Group
    │   ├── Layer
    │   └── Layer
    │
    └── Layer
```

---

# 32. Rendering Architecture

Rendering should have three conceptual layers:

```text
Document Model
      ↓
Scene Graph
      ↓
SVG Renderer
      ↓
Canvas / DOM
```

The SVG renderer should generate the actual SVG scene.

Do not create a separate raster representation as the primary source of truth.

---

# 33. Selection Overlay

Selection UI should be rendered separately from the SVG artwork.

Example:

```text
Artwork
+
Selection overlay
+
Node editor overlay
+
Guides
+
Grid
```

This prevents editor controls from becoming part of exported SVG.

---

# 34. Node Rendering

When a Path layer is selected:

```text
        ●────────●
       /          \
      /            \
     ●              ●
      \            /
       \──────────●
```

Nodes should visually indicate:

* Anchor points
* Selected points
* Control handles
* Incoming handle
* Outgoing handle
* Subpath start
* Closed path

---

# 35. Path Interaction Modes

## Object mode

Selecting the entire path.

```text
[ bounding box ]
```

## Node mode

Editing individual nodes.

```text
●───●───●
```

## Command mode

Selecting individual path commands.

```text
M
C
L
A
Z
```

---

# 36. Path Command List

Optional panel:

```text
Path

1  M  20 20
2  L  100 20
3  C  120 20 140 40 140 60
4  Z
```

Selecting a command highlights the corresponding geometry.

---

# 37. Subpaths

A single path may contain multiple subpaths.

Example:

```text
M 10 10
L 100 10
Z

M 200 200
L 300 200
Z
```

The editor must preserve these as part of the same Path Layer.

Users should be able to:

* Select subpath
* Reverse subpath
* Delete subpath
* Move subpath
* Start path from selected command

---

# 38. Coordinate Systems

The editor must correctly handle:

* SVG viewport coordinates
* ViewBox coordinates
* Local layer coordinates
* Group coordinates
* Transform matrices
* Screen coordinates

All node editing must correctly account for parent transforms.

---

# 39. Transform Matrix

Internally support:

```ts
interface Transform {
  matrix: Matrix
}
```

Represented as:

```text
[a c e]
[b d f]
[0 0 1]
```

This prevents accumulated floating-point errors caused by repeatedly modifying
individual x/y/rotation values.

---

# 40. Zoom / Pan

Controls:

```text
Zoom In
Zoom Out
Fit
100%
200%
400%
800%
```

Mouse:

```text
Wheel              → Zoom
Space + Drag       → Pan
Middle Mouse       → Pan
Cmd/Ctrl + Wheel   → Zoom
```

---

# 41. Grid

Optional:

```text
Grid
├── Show
├── Snap
├── Size
└── Subdivision
```

Default:

```text
10 × 10
```

Holding `Ctrl/Cmd` while dragging should temporarily disable snapping.

---

# 42. Guides

Future:

* Horizontal guides
* Vertical guides
* Drag from ruler
* Snap to guides

---

# 43. Keyboard Shortcuts

Minimum:

```text
V       Select
A       Node
P       Pen
R       Rectangle
E       Ellipse
L       Line
T       Text
H       Hand

Delete / Backspace
Cmd/Ctrl + Z
Cmd/Ctrl + Shift + Z
Cmd/Ctrl + C
Cmd/Ctrl + X
Cmd/Ctrl + V
Cmd/Ctrl + D

Cmd/Ctrl + G
Cmd/Ctrl + Shift + G

Cmd/Ctrl + S
Cmd/Ctrl + O
Cmd/Ctrl + E
```

---

# 44. File Operations

## Open

```text
.svg
```

## Save

```text
.svg
```

## Export

```text
.svg
.png
```

PNG export is optional for MVP.

---

# 45. Drag & Drop

Dropping an SVG onto the application should automatically import it.

Dropping multiple SVGs may optionally create multiple documents.

---

# 46. Error Handling

Invalid SVG must never crash the editor.

Display:

```text
Unable to parse SVG

Line 32:
Invalid path command.
```

Invalid path:

```text
Invalid path data

The path could not be parsed.
Revert
Edit manually
```

---

# 47. Performance

Target:

```text
1,000 layers
10,000 path commands
100,000 path commands
```

The editor should remain responsive for normal documents.

Optimize:

* Selection rendering
* Node rendering
* Hit testing
* Scene graph updates
* Path parsing
* Path serialization

Avoid rebuilding the entire document for every mouse movement.

---

# 48. Hit Testing

The editor must distinguish between:

```text
Layer hit
Path hit
Node hit
Handle hit
Bounding box hit
```

Priority:

```text
Node
↓
Handle
↓
Selected layer
↓
Other layer
↓
Canvas
```

---

# 49. Data Flow

Recommended:

```text
User Input
    ↓
Command
    ↓
Document Mutation
    ↓
History
    ↓
Scene Graph Update
    ↓
Renderer
```

Do not mutate SVG DOM directly as the primary state mechanism.

---

# 50. Command Architecture

Every document mutation should be represented as a command.

Example:

```ts
interface Command {
  execute(): void
  undo(): void
}
```

Examples:

```text
MoveNodeCommand
DeleteNodeCommand
InsertCommand
ChangeFillCommand
TransformLayerCommand
DeleteLayerCommand
RenameLayerCommand
GroupLayersCommand
```

This makes undo/redo reliable.

---

# 51. Path Engine

The path engine should be independent from the UI.

Suggested modules:

```text
path/
├── parser
├── serializer
├── geometry
├── commands
├── transforms
├── bounds
├── hit-test
├── normalize
├── optimize
└── boolean
```

The engine should expose APIs such as:

```ts
parsePath(d)
serializePath(commands)

insertCommand(path, index, command)
deleteCommand(path, index)

convertCommand(path, index, type)

reverseSubpath(path, index)

transformPath(path, matrix)

getBounds(path)

hitTestPath(path, point)
```

---

# 52. SVG Parser

Separate SVG parsing from the editor.

```ts
parseSVG(source): Document
```

Responsibilities:

* XML parsing
* SVG hierarchy
* styles
* attributes
* transforms
* path extraction
* primitive extraction
* groups
* defs
* references

---

# 53. SVG Serializer

```ts
serializeSVG(document): string
```

Must produce standards-compliant SVG.

The serializer should support pretty-printing.

Optional:

```text
Minify SVG
```

---

# 54. Style System

Styles should be represented separately from geometry.

```ts
interface Style {
  fill: Fill
  stroke: Stroke
  opacity: number
  fillOpacity: number
  strokeOpacity: number
  blendMode?: string
}
```

---

# 55. Layer Thumbnails

Each layer should have a small preview.

Example:

```text
┌──────┐
│  ◇   │ Path
└──────┘
```

Thumbnails should be generated from the actual vector geometry.

---

# 56. Layer Names

Automatically generated names:

```text
Path
Path 2
Rectangle
Circle
Group
Text
```

If an SVG contains:

```html
<path id="logo-mark">
```

use:

```text
logo-mark
```

as the default layer name.

---

# 57. IDs

Each layer should have an internal UUID.

SVG IDs should be preserved separately.

Example:

```ts
{
  internalId: "uuid",
  svgId: "logo-mark"
}
```

Never use SVG IDs as the internal identity.

---

# 58. Visibility

Hidden layers:

```text
visible = false
```

must not participate in normal selection/hit testing.

---

# 59. Locking

Locked layers:

```text
locked = true
```

cannot be transformed or edited.

They may still be selected for inspection if desired.

---

# 60. Opacity

Support:

```text
Layer opacity
Fill opacity
Stroke opacity
```

---

# 61. Group Selection

Clicking a child selects the child.

Optional modifier:

```text
Cmd/Ctrl + click
```

selects through parent hierarchy.

---

# 62. Path Editing UX

The path editor should feel extremely responsive.

Dragging:

```text
pointerdown
→ begin transaction

pointermove
→ update geometry

pointerup
→ commit transaction
```

Undo should treat this entire operation as one action.

---

# 63. Pen Tool

The Pen tool should create:

```text
M
L
C
Q
```

commands interactively.

Basic flow:

```text
Click
→ Move
→ Click
→ Line

Click + Drag
→ Bézier curve
```

Double-click:

```text
Finish path
```

Enter:

```text
Finish path
```

Escape:

```text
Cancel current path
```

---

# 64. Pencil Tool

Future feature.

Freehand mouse/stylus input should generate a path.

Pipeline:

```text
Pointer samples
↓
Smoothing
↓
Simplification
↓
Bezier fitting
↓
Path
```

---

# 65. Responsive Design

Desktop-first.

Minimum target:

```text
1280 × 720
```

Should remain usable at:

```text
1024 × 768
```

Tablet support can come later.

---

# 66. Accessibility

Support:

* Keyboard navigation
* Visible focus
* Accessible layer names
* ARIA labels for controls
* Keyboard-only layer selection
* Keyboard-only node manipulation where practical

---

# 67. Browser Support

Target:

```text
Chrome
Edge
Firefox
Safari
```

Modern versions only.

---

# 68. Architecture

Recommended high-level structure:

```text
apps/
└── editor/

packages/
├── svg-core/
├── svg-parser/
├── svg-path/
├── svg-renderer/
├── svg-history/
├── svg-selection/
├── svg-transform/
├── svg-serializer/
└── ui/
```

The core SVG/path engine should have no dependency on the UI framework.

---

# 69. Separation of Concerns

Strict separation:

```text
UI
│
├── Toolbar
├── Layers
├── Inspector
└── Canvas UI
       │
       ↓
Editor Controller
       │
       ↓
Document Model
       │
       ├── SVG Parser
       ├── Path Engine
       ├── History
       └── Serializer
```

---

# 70. Rendering Strategy

Preferred initial implementation:

```text
SVG DOM
+
HTML UI overlays
```

The SVG itself acts as the rendering surface.

Benefits:

* Native SVG rendering
* Native transforms
* Native paths
* Easy SVG export
* No rasterization
* Excellent browser compatibility

Canvas/WebGL rendering can be considered later if performance becomes a bottleneck.

---

# 71. Selection Overlay Architecture

Do not modify the actual SVG to render editor controls.

Instead:

```text
SVG Artwork
     +
HTML/SVG Editor Overlay
```

Editor overlay contains:

```text
Bounding boxes
Nodes
Handles
Guides
Selection indicators
```

---

# 72. Import Normalization

Imported SVG should not necessarily be rewritten immediately.

Maintain:

```text
Original SVG semantics
```

and normalize only when required.

Example:

```text
<rect>
```

should remain a rectangle.

Only when user selects:

```text
Convert to Path
```

should it become:

```text
<path>
```

---

# 73. Path Normalization

The path engine may internally normalize commands.

Example:

```text
H
V
S
T
```

may be converted into canonical representations for editing.

However, serialization should be able to preserve the user's preferred representation
when possible.

---

# 74. Precision

Internal geometry should use double precision.

Export precision should be configurable.

Default:

```text
3–6 decimal places
```

Avoid unnecessary floating point noise.

---

# 75. Autosave

Optional local autosave:

```text
IndexedDB
```

Save:

```text
Document state
History metadata
Viewport
```

Autosave interval:

```text
1–5 seconds after modification
```

---

# 76. Crash Recovery

On reopening after a crash:

```text
Recover unsaved document?
```

---

# 77. Clipboard SVG

Copying a layer should optionally produce valid SVG on the clipboard.

Example:

```svg
<path d="..." fill="..." />
```

This enables:

```text
Editor → Figma
Editor → Illustrator
Editor → Browser
```

---

# 78. MVP

The first release should NOT attempt to implement every feature.

MVP must include:

## Document

* New document
* Open SVG
* Save SVG
* Export SVG

## Canvas

* Pan
* Zoom
* Fit
* Grid

## Layers

* Layer panel
* Select
* Rename
* Delete
* Duplicate
* Hide
* Lock
* Reorder

## Paths

* Import paths
* Parse path commands
* Node editing
* Bézier handles
* Add command
* Delete command
* Convert command
* Reverse subpath
* Raw `d` editor

## Shapes

* Rectangle
* Circle
* Ellipse
* Line
* Polygon
* Polyline

## Transform

* Move
* Scale
* Rotate

## Appearance

* Fill
* Stroke
* Stroke width
* Opacity

## History

* Undo
* Redo

---

# 79. MVP Success Criteria

A user should be able to:

1. Open a complex SVG.
2. See its structure as layers.
3. Select one path.
4. Enter node-editing mode.
5. Drag nodes.
6. Drag Bézier handles.
7. Add/delete path commands.
8. Change fill/stroke.
9. Move/scale/rotate the path.
10. Reorder layers.
11. Undo/redo changes.
12. Export the result as valid SVG.
13. Reopen the exported SVG without losing the visual result.

---

# 80. Phase 2

Add:

* Pen tool
* Better snapping
* Alignment
* Guides
* Gradient
* Text
* Better primitive editing
* SVG clipboard
* Layer thumbnails
* SVG optimization

---

# 81. Phase 3

Add:

* Boolean operations
* Compound paths
* Masks
* Clip paths
* Patterns
* Symbols
* `<use>`
* Advanced typography
* Filters
* Blend modes

---

# 82. Phase 4

Add:

* Plugins
* Components
* Templates
* Collaboration
* Cloud documents
* Version history

---

# 83. Important Technical Decision

The most important architectural decision is:

> Do NOT make the SVG string the application's primary state.

Bad:

```text
SVG String
↓
Modify DOM
↓
Serialize SVG
```

Preferred:

```text
Document Model
      ↓
Scene Graph
      ↓
SVG Renderer
      ↓
SVG Serializer
```

For paths:

```text
SVG d string
      ↓
Parser
      ↓
Structured Path Commands
      ↓
Path Editor
      ↓
Structured Path Commands
      ↓
Serializer
      ↓
SVG d string
```

This is what allows the application to behave like a real vector editor.

---

# 84. Example Internal Document

```ts
const document = {
  width: 512,
  height: 512,

  viewBox: {
    x: 0,
    y: 0,
    width: 512,
    height: 512
  },

  layers: [
    {
      id: "layer-1",
      type: "path",
      name: "Logo",

      geometry: {
        commands: [
          {
            type: "M",
            x: 20,
            y: 20
          },
          {
            type: "C",
            x1: 30,
            y1: 10,
            x2: 80,
            y2: 10,
            x: 100,
            y: 50
          },
          {
            type: "Z"
          }
        ]
      },

      style: {
        fill: "#000000",
        stroke: "none",
        opacity: 1
      },

      transform: {
        matrix: [1, 0, 0, 1, 0, 0]
      },

      visible: true,
      locked: false
    }
  ]
}
```

---

# 85. Relationship With svg-path-editor

Use Yqnn/svg-path-editor primarily as inspiration/reference for:

* Path command model
* Path parser
* Node editing
* Bézier handles
* Command insertion
* Command deletion
* Command conversion
* Relative/absolute conversion
* Subpath operations
* Path reversal
* Grid snapping
* Undo/redo interaction

The project already exposes a standalone `svg-path-editor-lib`, which makes its architecture
particularly useful as a reference for the path-engine portion. ([GitHub][1])

However, the new application should introduce a higher-level:

```text
Document
  ↓
Layer
  ↓
Shape
  ↓
Path
  ↓
Command
  ↓
Point
```

architecture.

---

# 86. Example User Flow

## Open SVG

```text
User opens logo.svg
        ↓
SVG Parser
        ↓
Document
        ↓
Layers
```

UI:

```text
Layers

▼ Logo
  ├── Background
  ├── Letter O
  ├── Letter X
  └── Symbol
```

User selects:

```text
Symbol
```

Then presses:

```text
Node Tool
```

The path becomes:

```text
●──────●
│      │
●──────●
```

User drags a node.

The internal command changes.

The SVG preview updates immediately.

User exports.

```text
Document
↓
SVG Serializer
↓
logo-edited.svg
```

---

# 87. Non-Goals for MVP

Do NOT initially implement:

* Full Photoshop raster editing
* Video
* 3D
* Complex SVG filters
* Advanced typography
* Real-time collaboration
* Cloud storage
* AI generation
* Plugin marketplace
* WebGL renderer

Focus entirely on:

> SVG + Paths + Layers + Vector editing.

---

# 88. Final Product Definition

The application is a:

> Layer-based SVG vector editor with a first-class path editing engine.

Its fundamental hierarchy is:

```text
SVG Document
      │
      ├── Layer
      │     └── Shape
      │           └── Path
      │                 └── Commands
      │                       └── Points
      │
      └── Layer
            └── Group
                  ├── Path
                  └── Path
```

The most important component is the Path Editor.

The Layers system sits above it.

The SVG serializer sits below it.

This gives the application the ability to behave like Photoshop/Figma while keeping
SVG as the native, editable output format.

````

### One architectural point I'd strongly recommend

Don't make **every SVG element immediately become a `<path>`**.

Keep:

```text
<rect>     → Rectangle Layer
<circle>   → Circle Layer
<ellipse>  → Ellipse Layer
<text>     → Text Layer
<path>     → Path Layer
````

Then provide **Convert to Path** when the user wants node-level editing.

That gives you a much cleaner editor model, while still making **Path Layer the ultimate editable primitive**. SVG itself treats `<path>` as the generic shape element, and its `d` data describes the actual path geometry. ([MDN Web Docs][3])

[1]: https://github.com/Yqnn/svg-path-editor?utm_source=chatgpt.com "GitHub - Yqnn/svg-path-editor: Online editor to create and manipulate SVG paths · GitHub"
[2]: https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/d?utm_source=chatgpt.com "d - SVG | MDN"
[3]: https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/path?utm_source=chatgpt.com "<path> - SVG | MDN"
