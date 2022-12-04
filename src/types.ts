export interface Position{
  x: number
  y: number
}

export enum Directions {
  Top= "top",
  Right = "right",
  Bottom = "bottom",
  Left = "left"
};

export enum Orientation {
  Horizontal = "horizontal",
  Vertical = "vertical"
};

export enum ElementTypeNames{
  Node = 'node',
  Line = 'line',
  Handle = 'handle',
  EditorLines = 'editor-lines',
  EditorNodes = 'editor-nodes',
  LineHandle = 'line-handle',
  LineText = 'line-text',
  Path = 'path'
}

export interface SizeProps{
  width: number
  height: number
}

// Key values constants
// Available values for `KeyboardEvent.key` attribute.
export const VALUE_CANCEL = 'Cancel';
export const VALUE_HELP = 'Help';
export const VALUE_BACK_SPACE = 'Backspace';
export const VALUE_TAB = 'Tab';
export const VALUE_CLEAR = 'Clear';
export const VALUE_ENTER = 'Enter';
export const VALUE_RETURN = 'Enter';
export const VALUE_SHIFT = 'Shift';
export const VALUE_CONTROL = 'Control';
export const VALUE_ALT = 'Alt';
export const VALUE_PAUSE = 'Pause';
export const VALUE_CAPS_LOCK = 'CapsLock';
export const VALUE_ESCAPE = 'Escape';
export const VALUE_SPACE = ' ';
export const VALUE_PAGE_UP = 'PageUp';
export const VALUE_PAGE_DOWN = 'PageDown';
export const VALUE_END = 'End';
export const VALUE_HOME = 'Home';
export const VALUE_LEFT = 'ArrowLeft';
export const VALUE_UP = 'ArrowUp';
export const VALUE_RIGHT = 'ArrowRight';
export const VALUE_DOWN = 'ArrowDown';
export const VALUE_PRINTSCREEN = 'PrintScreen';
export const VALUE_INSERT = 'Insert';
export const VALUE_DELETE = 'Delete';
export const VALUE_0 = '0';
export const VALUE_1 = '1';
export const VALUE_2 = '2';
export const VALUE_3 = '3';
export const VALUE_4 = '4';
export const VALUE_5 = '5';
export const VALUE_6 = '6';
export const VALUE_7 = '7';
export const VALUE_8 = '8';
export const VALUE_9 = '9';
export const VALUE_A = 'a';
export const VALUE_B = 'b';
export const VALUE_C = 'c';
export const VALUE_D = 'd';
export const VALUE_E = 'e';
export const VALUE_F = 'f';
export const VALUE_G = 'g';
export const VALUE_H = 'h';
export const VALUE_I = 'i';
export const VALUE_J = 'j';
export const VALUE_K = 'k';
export const VALUE_L = 'l';
export const VALUE_M = 'm';
export const VALUE_N = 'n';
export const VALUE_O = 'o';
export const VALUE_P = 'p';
export const VALUE_Q = 'q';
export const VALUE_R = 'r';
export const VALUE_S = 's';
export const VALUE_T = 't';
export const VALUE_U = 'u';
export const VALUE_V = 'v';
export const VALUE_W = 'w';
export const VALUE_X = 'x';
export const VALUE_Y = 'y';
export const VALUE_Z = 'z';
export const VALUE_META = 'Meta';
export const VALUE_LEFT_CMD = 'Meta';
export const VALUE_RIGHT_CMD = 'Meta';
export const VALUE_CONTEXT_MENU = 'ContextMenu';
export const VALUE_NUMPAD0 = '0';
export const VALUE_NUMPAD1 = '1';
export const VALUE_NUMPAD2 = '2';
export const VALUE_NUMPAD3 = '3';
export const VALUE_NUMPAD4 = '4';
export const VALUE_NUMPAD5 = '5';
export const VALUE_NUMPAD6 = '6';
export const VALUE_NUMPAD7 = '7';
export const VALUE_NUMPAD8 = '8';
export const VALUE_NUMPAD9 = '9';
export const VALUE_MULTIPLY = '*';
export const VALUE_ADD = '+';
export const VALUE_SUBTRACT = '-';
export const VALUE_DECIMAL = '.';
export const VALUE_DIVIDE = '/';
export const VALUE_F1 = 'F1';
export const VALUE_F2 = 'F2';
export const VALUE_F3 = 'F3';
export const VALUE_F4 = 'F4';
export const VALUE_F5 = 'F5';
export const VALUE_F6 = 'F6';
export const VALUE_F7 = 'F7';
export const VALUE_F8 = 'F8';
export const VALUE_F9 = 'F9';
export const VALUE_F10 = 'F10';
export const VALUE_F11 = 'F11';
export const VALUE_F12 = 'F12';
export const VALUE_F13 = 'F13';
export const VALUE_F14 = 'F14';
export const VALUE_F15 = 'F15';
export const VALUE_F16 = 'F16';
export const VALUE_F17 = 'F17';
export const VALUE_F18 = 'F18';
export const VALUE_F19 = 'F19';
export const VALUE_F20 = 'F20';
export const VALUE_F21 = 'F21';
export const VALUE_F22 = 'F22';
export const VALUE_F23 = 'F23';
export const VALUE_F24 = 'F24';
export const VALUE_NUM_LOCK = 'NumLock';
export const VALUE_SCROLL_LOCK = 'ScrollLock';
export const VALUE_SEMICOLON = ';';
export const VALUE_EQUALS = '=';
export const VALUE_COMMA = ',';
export const VALUE_DASH = '-';
export const VALUE_PERIOD = '.';
export const VALUE_SLASH = '/';
export const VALUE_BACK_QUOTE = '`';
export const VALUE_OPEN_BRACKET = '[';
export const VALUE_BACK_SLASH = '\\';
export const VALUE_CLOSE_BRACKET = ']';
export const VALUE_QUOTE = "'";