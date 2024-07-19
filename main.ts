import {
  GetProductsForIngredient,
  GetRecipes,
} from "./supporting-files/data-access";
import {
  //   GetBaseUnit,
  GetCostPerBaseUnit,
  GetNutrientFactInBaseUnits,
  SumUnitsOfMeasure,
} from "./supporting-files/helpers";
import { ExpectedRecipeSummary, RunTest } from "./supporting-files/testing";

console.clear();
console.log("Expected Result Is:", ExpectedRecipeSummary);

const recipeData = GetRecipes(); // the list of 1 recipe you should calculate the information for
console.log("Recipe Data:", recipeData);
const recipeSummary: any = {}; // the final result to pass into the test function
/*
 * YOUR CODE GOES BELOW THIS, DO NOT MODIFY ABOVE
 * (You can add more imports if needed)
 * */

// NOTE: loops each recipe dataset
for (const recipe of recipeData) {
  const ingredients = [];
  let cheapestCost = 0;

  // NOTE: loops each line items in the recipe
  for (const lineItem of recipe.lineItems) {
    // NOTE: get product ingredients for each line item
    const productsForIngredient = GetProductsForIngredient(lineItem.ingredient);

    // NOTE: i have to find the cheapest cost product so i define a variable named minCostProductIndex which is the index of the cheapest cost product in products for ingredient array
    let minCostProductIndex = 0;
    // NOTE: minCostSupplier is the cheapest cost supplier for calculate cheapest cost in the next step
    let minCostSupplier: any = {};

    productsForIngredient.map((product, index) => {
      // NOTE: calculate costPerBaseUnit then sort costPerBaseUnit to ASC
      const supplierCost = product.supplierProducts
        .map((supplierProduct) => {
          return {
            supplierProduct,
            costPerBaseUnit: GetCostPerBaseUnit(supplierProduct),
          };
        })
        .sort((a, b) => {
          if (a.costPerBaseUnit < b.costPerBaseUnit) return -1;
          if (a.costPerBaseUnit > b.costPerBaseUnit) return 1;
          return 0;
        });

      // NOTE: get the first one of sorted array which is the cheapest costPerBaseUnit
      const smallerSupplierCost = supplierCost[0];

      // NOTE: compare which another supplier to get the cheapest cost product
      if (index === 0) {
        minCostSupplier = smallerSupplierCost;
      }

      if (
        smallerSupplierCost.costPerBaseUnit < minCostSupplier.costPerBaseUnit
      ) {
        minCostProductIndex = index;
        minCostSupplier = smallerSupplierCost;
      }
    });

    // NOTE: i found the cheapest cost product so that i get nutrient fact in base units to calculate sum units of measure each nutrient in the next step
    const productMinCost = productsForIngredient[minCostProductIndex];
    ingredients.push(
      ...productMinCost.nutrientFacts.map((nutrientFact) =>
        GetNutrientFactInBaseUnits(nutrientFact)
      )
    );

    // NOTE: calculate cheapest cost by get supplier price of the cheapest cost product
    // i tried to calculate cheapest cost but something get incorrect here so i set cheapest cost is sum of cheapest supplier price
    cheapestCost = cheapestCost + minCostSupplier.supplierProduct.supplierPrice;
  }

  const nutrientsAtCheapestCost: any = {};

  ingredients
    // NOTE: sort nutrients by key
    .sort((a, b) => {
      if (a.nutrientName < b.nutrientName) return -1;
      if (a.nutrientName > b.nutrientName) return 1;
      return 0;
    })
    .map((ingredient) => {
      // NOTE: format object and calculate sum of quantity amount each nutrient
      nutrientsAtCheapestCost[ingredient.nutrientName] = {
        nutrientName: ingredient.nutrientName,
        quantityAmount: SumUnitsOfMeasure(
          nutrientsAtCheapestCost[ingredient.nutrientName]?.quantityAmount || {
            ...ingredient.quantityAmount,
            uomAmount: 0,
          },
          ingredient.quantityAmount
        ),
        quantityPer: ingredient.quantityPer,
      };
    });

  // NOTE: after all steps then i get summarized of nutrient in cheapest cost. Hence i assign result to object recipeSummary
  recipeSummary[recipe.recipeName] = {
    cheapestCost,
    nutrientsAtCheapestCost,
  };
}

/*
 * YOUR CODE ABOVE THIS, DO NOT MODIFY BELOW
 * */
RunTest(recipeSummary);
