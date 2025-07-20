export interface TablePaletteOptions {
  container: ContainerPaletteOptions;
  header: TableSectionPaletteOptions;
  row: RowTableSectionPaletteOptions;
  cell: TableSectionPaletteOptions;
}
export interface ContainerPaletteOptions {
  borderColor: string;
  backgroundColor: string;
  textColor: string;
}
export interface TableSectionPaletteOptions {
  borderColor: PaletteStateOptions;
  backgroundColor: PaletteStateOptions;
  textColor: PaletteStateOptions;
}

export interface RowTableSectionPaletteOptions extends TableSectionPaletteOptions {
  backgroundColor: HoverPaletteOptions;
}
export interface PaletteStateOptions {
  default: string;
  hovered: string;
  selected: string;
}

export interface HoverPaletteOptions extends PaletteStateOptions {
  selectedHovered: string;
}

