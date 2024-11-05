export const REGION = "us-east-1";
export const TABLE_NAMES = {
  ITEMS: "dev-items",
};
export const ITEM_STATES = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  UNPUBLISHED: "unpublished",
  COMPLETED: "completed",
} as const;
export const MESSAGES = {
  ITEM_NOT_FOUND: "Item not found",
  INVALID_STATE: "Invalid item state for this action",
  PUBLISH_SUCCESS: "Item published successfully",
  UNPUBLISH_SUCCESS: "Item unpublished successfully",
  REVIEW_SUCCESS: "Item submitted for review successfully",
  INTERNAL_SERVER_ERROR: "Internal Server Error",
};
