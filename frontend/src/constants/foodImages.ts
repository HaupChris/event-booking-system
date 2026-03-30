/**
 * Shared food images mapping used across user and artist food selection forms.
 * Maps food option IDs to their corresponding images.
 */

import gyros from '../img/gyros.png';
import wraps from '../img/wraps.png';
import vegan_diet from '../img/both_meals_vegan.png';
import vegetarian_diet from '../img/both_meals_vegetarian.png';

export const foodImages: { [key: number]: string } = {
  0: gyros,
  1: gyros,
  2: wraps,
  3: wraps,
  4: vegan_diet,
  5: vegetarian_diet,
};
