// This file is auto-generated by @hey-api/openapi-ts

export type SellerCreationRequest = {
    username: string;
    emailAddress: string;
    password: string;
};

export type OTP = {
    OTP: string;
    emailAddress: string;
};

export type Seller = {
    id: string;
    username: string;
    emailAddress: string;
    fund: number;
    isFrozen: boolean;
    isClosed: boolean;
    itemIds: Array<(string)>;
    OTP?: string;
    createAt: number;
};

export type LoginRequest = {
    username: string;
    password: string;
};

export type LoginResponse = {
    token?: string;
    sellerId?: string;
    buyerId?: string;
};

export type CloseAccountResponse = {
    message?: string;
    sellerId?: string;
    buyerId?: string;
    isClosed?: boolean;
};

export type AddItemRequest = {
    name: string;
    description: string;
    initPrice: number;
    lengthOfAuction: number;
    images: Array<((Blob | File))>;
};

export type Item = {
    id: string;
    name: string;
    description: string;
    initPrice: number;
    startDate: string;
    endDate: string;
    itemState: 'inactive' | 'active' | 'failed' | 'completed' | 'archived';
    isFrozen: boolean;
    images: Array<(string)>;
    currentBidId?: string;
    pastBidIds?: Array<(string)>;
    soldTime?: string;
    soldBidId?: string;
    sellerId: string;
    createAt: number;
};

export type itemState = 'inactive' | 'active' | 'failed' | 'completed' | 'archived';

export type ItemSummary = {
    id?: string;
    name?: string;
    itemState?: string;
    startDate?: string;
    endDate?: string;
    currentBid?: number;
    soldTime?: string;
};

export type EditItemRequest = {
    name?: string;
    description?: string;
    initPrice?: number;
    images?: Array<((Blob | File))>;
};

export type ActionResponse = {
    message?: string;
    itemId?: string;
    sellerId?: string;
    buyerId?: string;
};

export type PublishItemRequest = {
    startDate?: string;
    endDate?: string;
};

export type ItemPublishResponse = {
    id?: string;
    itemState?: string;
    startDate?: string;
    endDate?: string;
};

export type ItemStateResponse = {
    message?: string;
    itemId?: string;
    itemState?: string;
};

export type FulfillItemResponse = {
    message?: string;
    itemId?: string;
    soldBid?: Bid;
    soldTime?: string;
};

export type BuyerCreationRequest = {
    username: string;
    emailAddress: string;
    password: string;
};

export type Buyer = {
    id: string;
    username: string;
    emailAddress: string;
    fund: number;
    isFrozen: boolean;
    isClosed: boolean;
    bidIds: Array<(string)>;
    purchases: Array<Purchase>;
    OTP?: string;
    createAt: number;
};

export type AddFundsRequest = {
    amount: number;
};

export type AddFundsResponse = {
    message?: string;
    buyerId?: string;
    fund?: number;
};

export type ActiveBid = {
    itemId?: string;
    itemName?: string;
    currentBid?: number;
    yourBid?: number;
    bidTime?: string;
    endDate?: string;
};

export type Purchase = {
    itemId?: string;
    itemName?: string;
    purchasePrice?: number;
    soldTime?: string;
    fulfillmentDate?: string;
};

export type PlaceBidRequest = {
    itemId: string;
    bidAmount: number;
};

export type BidResponse = {
    message?: string;
    bid?: Bid;
};

export type Bid = {
    id: string;
    bidUserId: string;
    bidAmount: number;
    bidTime: string;
    createAt: number;
};

export type ItemDetails = {
    id?: string;
    name?: string;
    description?: string;
    images?: Array<(string)>;
    price?: number;
    startDate?: string;
    endDate?: string;
    highestBid?: number;
    biddingHistory?: Array<Bid>;
};

export type RecentlySoldItem = {
    id?: string;
    name?: string;
    price?: number;
    soldTime?: string;
    biddingHistory?: Array<Bid>;
};

export type FreezeActionRequest = {
    action: 'freeze' | 'unfreeze';
};

export type action = 'freeze' | 'unfreeze';

export type FreezeActionResponse = {
    message?: string;
    sellerId?: string;
    buyerId?: string;
    itemId?: string;
    isFrozen?: boolean;
};

export type AuctionReport = {
    totalCommissionEarned?: number;
    totalSales?: number;
    commissionRate?: number;
    itemsSold?: Array<{
        itemId?: string;
        salePrice?: number;
        commission?: number;
    }>;
};

export type ForensicsReport = {
    reportId?: string;
    url?: string;
};

export type ParameterSellerId = string;

export type ParameterBuyerId = string;

export type ParameterItemId = string;

/**
 * Keywords for searching items
 */
export type ParameterKeywords = string;

/**
 * Minimum price for filtering items
 */
export type ParameterMinPrice = number;

/**
 * Maximum price for filtering items
 */
export type ParameterMaxPrice = number;

/**
 * Field to sort by
 */
export type ParameterSortBy = 'price' | 'date';

/**
 * Sort order
 */
export type ParameterSortOrder = 'asc' | 'desc';

export type PostApiLoginData = {
    body: {
        email?: string;
        password?: string;
    };
};

export type PostApiLoginResponse = ({
    status?: number;
    errorCode?: (string) | null;
    message?: string;
    payload?: {
        token?: string;
    };
});

export type PostApiLoginError = unknown;

export type PostApiRegisterData = {
    body: {
        username?: string;
        password?: string;
        email?: string;
        firstName?: string;
        lastName?: string;
        userType?: 'seller' | 'buyer';
        role?: 'admin' | 'user';
        isActive?: boolean;
    };
};

export type PostApiRegisterResponse = ({
    status?: number;
    errorCode?: (string) | null;
    message?: string;
    payload?: {
        [key: string]: unknown;
    } | null;
});

export type PostApiRegisterError = unknown;

export type PostApiVerifyData = {
    body: OTP;
};

export type PostApiVerifyResponse = (unknown);

export type PostApiVerifyError = unknown;

export type PostApiSellersBySellerIdCloseData = {
    path: {
        sellerId: string;
    };
};

export type PostApiSellersBySellerIdCloseResponse = (CloseAccountResponse);

export type PostApiSellersBySellerIdCloseError = unknown;

export type PostApiSellersBySellerIdItemsData = {
    body: AddItemRequest;
    path: {
        sellerId: string;
    };
};

export type PostApiSellersBySellerIdItemsResponse = (unknown);

export type PostApiSellersBySellerIdItemsError = unknown;

export type GetApiSellersBySellerIdItemsData = {
    path: {
        sellerId: string;
    };
};

export type GetApiSellersBySellerIdItemsResponse = (Array<ItemSummary>);

export type GetApiSellersBySellerIdItemsError = unknown;

export type PutApiSellersBySellerIdItemsByItemIdData = {
    body: EditItemRequest;
    path: {
        itemId: string;
        sellerId: string;
    };
};

export type PutApiSellersBySellerIdItemsByItemIdResponse = (Item);

export type PutApiSellersBySellerIdItemsByItemIdError = unknown;

export type DeleteApiSellersBySellerIdItemsByItemIdData = {
    path: {
        itemId: string;
        sellerId: string;
    };
};

export type DeleteApiSellersBySellerIdItemsByItemIdResponse = (ActionResponse);

export type DeleteApiSellersBySellerIdItemsByItemIdError = unknown;

export type PostApiSellersBySellerIdItemsByItemIdPublishData = {
    body?: PublishItemRequest;
    path: {
        itemId: string;
        sellerId: string;
    };
};

export type PostApiSellersBySellerIdItemsByItemIdPublishResponse = (ItemPublishResponse);

export type PostApiSellersBySellerIdItemsByItemIdPublishError = unknown;

export type PostApiSellersBySellerIdItemsByItemIdUnpublishData = {
    path: {
        itemId: string;
        sellerId: string;
    };
};

export type PostApiSellersBySellerIdItemsByItemIdUnpublishResponse = (ItemStateResponse);

export type PostApiSellersBySellerIdItemsByItemIdUnpublishError = unknown;

export type PostApiSellersBySellerIdItemsByItemIdFulfillData = {
    path: {
        itemId: string;
        sellerId: string;
    };
};

export type PostApiSellersBySellerIdItemsByItemIdFulfillResponse = (FulfillItemResponse);

export type PostApiSellersBySellerIdItemsByItemIdFulfillError = unknown;

export type PostApiSellersBySellerIdItemsByItemIdArchiveData = {
    path: {
        itemId: string;
        sellerId: string;
    };
};

export type PostApiSellersBySellerIdItemsByItemIdArchiveResponse = (ItemStateResponse);

export type PostApiSellersBySellerIdItemsByItemIdArchiveError = unknown;

export type PostApiSellersBySellerIdItemsByItemIdRequestUnfreezeData = {
    path: {
        itemId: string;
        sellerId: string;
    };
};

export type PostApiSellersBySellerIdItemsByItemIdRequestUnfreezeResponse = (ActionResponse);

export type PostApiSellersBySellerIdItemsByItemIdRequestUnfreezeError = unknown;

export type PostApiBuyersByBuyerIdCloseData = {
    path: {
        buyerId: string;
    };
};

export type PostApiBuyersByBuyerIdCloseResponse = (CloseAccountResponse);

export type PostApiBuyersByBuyerIdCloseError = unknown;

export type PostApiBuyersByBuyerIdAddFundsData = {
    body: AddFundsRequest;
    path: {
        buyerId: string;
    };
};

export type PostApiBuyersByBuyerIdAddFundsResponse = (AddFundsResponse);

export type PostApiBuyersByBuyerIdAddFundsError = unknown;

export type GetApiBuyersByBuyerIdActiveBidsData = {
    path: {
        buyerId: string;
    };
};

export type GetApiBuyersByBuyerIdActiveBidsResponse = (Array<ActiveBid>);

export type GetApiBuyersByBuyerIdActiveBidsError = unknown;

export type GetApiBuyersByBuyerIdPurchasesData = {
    path: {
        buyerId: string;
    };
};

export type GetApiBuyersByBuyerIdPurchasesResponse = (Array<Purchase>);

export type GetApiBuyersByBuyerIdPurchasesError = unknown;

export type PostApiBuyersByBuyerIdBidsData = {
    body: PlaceBidRequest;
    path: {
        buyerId: string;
    };
};

export type PostApiBuyersByBuyerIdBidsResponse = (BidResponse);

export type PostApiBuyersByBuyerIdBidsError = unknown;

export type GetApiItemsData = {
    query?: {
        /**
         * Keywords for searching items
         */
        keywords?: string;
        /**
         * Maximum price for filtering items
         */
        maxPrice?: number;
        /**
         * Minimum price for filtering items
         */
        minPrice?: number;
        /**
         * Field to sort by
         */
        sortBy?: 'price' | 'date';
        /**
         * Sort order
         */
        sortOrder?: 'asc' | 'desc';
    };
};

export type GetApiItemsResponse = (Array<ItemSummary>);

export type GetApiItemsError = unknown;

export type GetApiItemsByItemIdData = {
    path: {
        itemId: string;
    };
};

export type GetApiItemsByItemIdResponse = (ItemDetails);

export type GetApiItemsByItemIdError = unknown;

export type GetApiItemsRecentlySoldData = {
    query?: {
        /**
         * Keywords for searching items
         */
        keywords?: string;
        /**
         * Maximum price for filtering items
         */
        maxPrice?: number;
        /**
         * Minimum price for filtering items
         */
        minPrice?: number;
        /**
         * Field to sort by
         */
        sortBy?: 'price' | 'date';
        /**
         * Sort order
         */
        sortOrder?: 'asc' | 'desc';
    };
};

export type GetApiItemsRecentlySoldResponse = (Array<RecentlySoldItem>);

export type GetApiItemsRecentlySoldError = unknown;

export type PostApiAdminItemsByItemIdFreezeData = {
    body: FreezeActionRequest;
    path: {
        itemId: string;
    };
};

export type PostApiAdminItemsByItemIdFreezeResponse = (FreezeActionResponse);

export type PostApiAdminItemsByItemIdFreezeError = unknown;

export type GetApiAdminReportsAuctionResponse = (AuctionReport);

export type GetApiAdminReportsAuctionError = unknown;

export type GetApiAdminReportsForensicsResponse = (ForensicsReport);

export type GetApiAdminReportsForensicsError = unknown;