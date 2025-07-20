export interface SecurityRatingOptions {
  levels: Record<'minimum' | 'low' | 'medium' | 'high' | 'severe', string>;
  borderColor: string;
  backgroundColor: string;
  textColor: string;
  contrastTextColor: string;
}
