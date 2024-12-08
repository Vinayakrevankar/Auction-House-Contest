// This file is auto-generated by @hey-api/openapi-ts

/**
 * User info
 */
export type UserInfo = {
    /**
     * Username
     */
    username: string;
    /**
     * User email
     */
    emailAddress: string;
    /**
     * User ID
     */
    userId: string;
    /**
     * User type, one of [seller, buyer]
     */
    userType: 'seller' | 'buyer';
    /**
     * User role, one of [admin, user]
     */
    role: 'admin' | 'user';
    /**
     * JWT token
     */
    token: string;
};

/**
 * User type, one of [seller, buyer]
 */
export type userType = 'seller' | 'buyer';

/**
 * User role, one of [admin, user]
 */
export type role = 'admin' | 'user';

/**
 * Item in auction
 */
export type Item = {
    /**
     * Item ID, in UUID
     */
    id: string;
    /**
     * Item name
     */
    name: string;
    /**
     * Item description
     */
    description: string;
    /**
     * Initial price, > $1
     */
    initPrice: number;
    /**
     * Auction start date time
     */
    startDate: string;
    /**
     * Auction end date time
     */
    endDate: string;
    /**
     * Auction length, in days
     */
    lengthOfAuction: number;
    /**
     * Is item available to buy immediately
     */
    isAvailableToBuy?: boolean;
    /**
     * Current state of item
     */
    itemState: 'active' | 'archived' | 'completed' | 'failed' | 'inactive';
    /**
     * Freeze status
     */
    isFrozen: boolean;
    /**
     * S3 image keys
     */
    images: Array<(string)>;
    /**
     * Current bid ID, in UUID
     */
    currentBidId?: string;
    /**
     * Historic bids
     */
    pastBidIds?: Array<(string)>;
    /**
     * Item sold bid ID, in UUID
     */
    soldBidId?: string;
    /**
     * Seller ID who posted the item
     */
    sellerId: string;
    /**
     * UNIX Timestamp
     */
    createAt: number;
};

/**
 * Current state of item
 */
export type itemState = 'active' | 'archived' | 'completed' | 'failed' | 'inactive';

/**
 * Bid to an item
 */
export type Bid = {
    /**
     * Bid ID, in UUID
     */
    id: string;
    /**
     * Item ID of the bid, in UUID
     */
    bidItemId: string;
    /**
     * Buyer ID who placed the bid
     */
    bidUserId: string;
    /**
     * Bid amount
     */
    bidAmount: number;
    /**
     * Bid time
     */
    bidTime: string;
    /**
     * UNIX Timestamp
     */
    createAt: number;
    /**
     * Is this bid the active bid of the item
     */
    isActive: boolean;
};

/**
 * Purchase Data
 */
export type Purchase = {
    /**
     * Item ID, in UUID
     */
    itemId: string;
    /**
     * Item name
     */
    itemName: string;
    /**
     * Purchased price
     */
    price: number;
    /**
     * Item sold time
     */
    soldTime: string;
    /**
     * Purchase fulfilled time
     */
    fulfillTime: string;
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

export type ForensicReport = {
    reportId: string;
    url: string;
};

export type ItemRequestPayload = {
    /**
     * Item name
     */
    name: string;
    /**
     * Item description
     */
    description: string;
    /**
     * Initial price of item, > $1
     */
    initPrice: number;
    /**
     * Length of auction in days
     */
    lengthOfAuction: number;
    /**
     * Is item available to buy immediately
     */
    isAvailableToBuy?: boolean;
    /**
     * S3 object keys for the images
     */
    images: Array<(string)>;
};

export type ItemFulfillResponsePayload = {
    itemId: string;
    soldBid: Bid;
    soldTime: string;
};

export type AddFundsResponsePayload = {
    /**
     * User ID of the target user
     */
    userId: string;
    /**
     * Funds after operation
     */
    funds: string;
};

export type ErrorResponsePayload = {
    status: number;
    errorCode?: string;
    message: string;
};

export type PlainSuccessResponsePayload = {
    /**
     * Response HTTP status
     */
    status: number;
    /**
     * Response message
     */
    message: string;
};

export type ParameterSellerID = string;

export type ParameterItemID = string;

export type ParameterBuyerID = string;

export type UserLoginData = {
    body?: {
        /**
         * User email
         */
        emailAddress: string;
        /**
         * User password
         */
        password: string;
    };
};

export type UserLoginResponse = ({
    /**
     * Response HTTP status
     */
    status: number;
    /**
     * Response message
     */
    message: string;
    payload: UserInfo;
});

export type UserLoginError = (ErrorResponsePayload);

export type UserRegisterData = {
    body?: {
        /**
         * Username
         */
        username: string;
        /**
         * User email address
         */
        emailAddress: string;
        /**
         * User password
         */
        password: string;
        /**
         * User first name
         */
        firstName: string;
        /**
         * User last name
         */
        lastName: string;
        /**
         * User type, one of [seller, buyer]
         */
        userType: 'seller' | 'buyer';
        /**
         * User role, one of [admin, user]
         */
        role: 'admin' | 'user';
    };
};

export type UserRegisterResponse = ({
    /**
     * Response HTTP status
     */
    status: number;
    /**
     * Response message
     */
    message: string;
    payload: UserInfo;
});

export type UserRegisterError = (ErrorResponsePayload);

export type UploadImageData = {
    body?: {
        /**
         * Image data to upload
         */
        image: (Blob | File);
    };
};

export type UploadImageResponse = ({
    /**
     * Response HTTP status
     */
    status: number;
    /**
     * Response message
     */
    message: string;
    /**
     * Response Payload
     */
    payload: {
        /**
         * S3 object key
         */
        key: string;
    };
});

export type UploadImageError = (ErrorResponsePayload);

export type SellerCloseData = {
    path: {
        sellerId: string;
    };
};

export type SellerCloseResponse = (PlainSuccessResponsePayload);

export type SellerCloseError = (ErrorResponsePayload);

export type SellerReviewItemData = {
    path: {
        sellerId: string;
    };
};

export type SellerReviewItemResponse = ({
    /**
     * Response HTTP status
     */
    status: number;
    /**
     * Response message
     */
    message: string;
    /**
     * Response Payload
     */
    payload: Array<Item>;
});

export type SellerReviewItemError = (ErrorResponsePayload);

export type SellerAddItemData = {
    body?: ItemRequestPayload;
    path: {
        sellerId: string;
    };
};

export type SellerAddItemResponse = (PlainSuccessResponsePayload);

export type SellerAddItemError = (ErrorResponsePayload);

export type SellerDeleteItemData = {
    path: {
        itemId: string;
        sellerId: string;
    };
};

export type SellerDeleteItemResponse = (PlainSuccessResponsePayload);

export type SellerDeleteItemError = (ErrorResponsePayload);

export type SellerUpdateItemData = {
    body?: ItemRequestPayload;
    path: {
        itemId: string;
        sellerId: string;
    };
};

export type SellerUpdateItemResponse = (PlainSuccessResponsePayload);

export type SellerUpdateItemError = (ErrorResponsePayload);

export type SellerItemPublishData = {
    path: {
        itemId: string;
        sellerId: string;
    };
};

export type SellerItemPublishResponse = (PlainSuccessResponsePayload);

export type SellerItemPublishError = (ErrorResponsePayload);

export type SellerItemUnpublishData = {
    path: {
        itemId: string;
        sellerId: string;
    };
};

export type SellerItemUnpublishResponse = (PlainSuccessResponsePayload);

export type SellerItemUnpublishError = (ErrorResponsePayload);

export type SellerItemFulfillData = {
    path: {
        itemId: string;
        sellerId: string;
    };
};

export type SellerItemFulfillResponse = ({
    /**
     * Response HTTP status
     */
    status: number;
    /**
     * Response message
     */
    message: string;
    payload: ItemFulfillResponsePayload;
});

export type SellerItemFulfillError = (ErrorResponsePayload);

export type SellerItemArchiveData = {
    path: {
        itemId: string;
        sellerId: string;
    };
};

export type SellerItemArchiveResponse = (PlainSuccessResponsePayload);

export type SellerItemArchiveError = (ErrorResponsePayload);

export type SellerItemRequestUnfreezeData = {
    path: {
        itemId: string;
        sellerId: string;
    };
};

export type SellerItemRequestUnfreezeResponse = (PlainSuccessResponsePayload);

export type SellerItemRequestUnfreezeError = (ErrorResponsePayload);

export type BuyerCloseData = {
    path: {
        buyerId: string;
    };
};

export type BuyerCloseResponse = (PlainSuccessResponsePayload);

export type BuyerCloseError = (ErrorResponsePayload);

export type BuyerAddFundsData = {
    body?: {
        /**
         * Amount of funds to add
         */
        amount: number;
    };
    path: {
        buyerId: string;
    };
};

export type BuyerAddFundsResponse = ({
    /**
     * Response HTTP status
     */
    status: number;
    /**
     * Response message
     */
    message: string;
    payload: AddFundsResponsePayload;
});

export type BuyerAddFundsError = (ErrorResponsePayload);

export type BuyerBidsData = {
    path: {
        buyerId: string;
    };
};

export type BuyerBidsResponse = ({
    /**
     * Response HTTP status
     */
    status: number;
    /**
     * Response message
     */
    message: string;
    /**
     * Response Payload
     */
    payload: Array<Bid>;
});

export type BuyerBidsError = (ErrorResponsePayload);

export type BuyerBidsPlaceData = {
    /**
     * Bid an item
     */
    body?: {
        /**
         * Item ID to bid, in UUID
         */
        itemId: string;
        /**
         * Bid amount
         */
        bidAmount: number;
        /**
         * Is item available to buy immediately
         */
        isAvailableToBuy?: boolean;
    };
    path: {
        buyerId: string;
    };
};

export type BuyerBidsPlaceResponse = ({
    /**
     * Response HTTP status
     */
    status: number;
    /**
     * Response message
     */
    message: string;
    payload: Bid;
});

export type BuyerBidsPlaceError = (ErrorResponsePayload);

export type BuyerPurchasesData = {
    path: {
        buyerId: string;
    };
};

export type BuyerPurchasesResponse = ({
    /**
     * Response HTTP status
     */
    status: number;
    /**
     * Response message
     */
    message: string;
    /**
     * Response Payload
     */
    payload: Array<Purchase>;
});

export type BuyerPurchasesError = (ErrorResponsePayload);

export type ItemSearchData = {
    query?: {
        /**
         * Keywords for searching item
         */
        keywords?: string;
        /**
         * Maximum price for item price range
         */
        maxPrice?: number;
        /**
         * Minimum price for item price range
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

export type ItemSearchResponse = ({
    /**
     * Response HTTP status
     */
    status: number;
    /**
     * Response message
     */
    message: string;
    payload: Item;
});

export type ItemSearchError = (ErrorResponsePayload);

export type ItemGetActiveResponse = ({
    /**
     * Response HTTP status
     */
    status: number;
    /**
     * Response message
     */
    message: string;
    /**
     * Response Payload
     */
    payload: Array<Item>;
});

export type ItemGetActiveError = (ErrorResponsePayload);

export type ItemDetailData = {
    path: {
        itemId: string;
    };
};

export type ItemDetailResponse = ({
    /**
     * Response HTTP status
     */
    status: number;
    /**
     * Response message
     */
    message: string;
    payload: Item;
});

export type ItemDetailError = (ErrorResponsePayload);

export type ItemBidsData = {
    path: {
        itemId: string;
    };
};

export type ItemBidsResponse = ({
    /**
     * Response HTTP status
     */
    status: number;
    /**
     * Response message
     */
    message: string;
    /**
     * Response Payload
     */
    payload: Array<Bid>;
});

export type ItemBidsError = (ErrorResponsePayload);

export type ItemRecentlySoldData = {
    query?: {
        /**
         * Keywords for searching item
         */
        keywords?: string;
        /**
         * Maximum price for item price range
         */
        maxPrice?: number;
        /**
         * Minimum price for item price range
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

export type ItemRecentlySoldResponse = ({
    /**
     * Response HTTP status
     */
    status: number;
    /**
     * Response message
     */
    message: string;
    /**
     * Response Payload
     */
    payload: Array<Item>;
});

export type ItemRecentlySoldError = (ErrorResponsePayload);

export type AdminFreezeItemData = {
    body?: {
        /**
         * Freeze or unfreeze
         */
        action: 'freeze' | 'unfreeze';
    };
    path: {
        itemId: string;
    };
};

export type AdminFreezeItemResponse = ({
    /**
     * Response HTTP status
     */
    status: number;
    /**
     * Response message
     */
    message: string;
    /**
     * Response Payload
     */
    payload: {
        /**
         * Target item ID
         */
        itemId: string;
        /**
         * Freeze state after operation
         */
        isFrozen: string;
    };
});

export type AdminFreezeItemError = (ErrorResponsePayload);

export type AdminAuctionReportResponse = ({
    /**
     * Response HTTP status
     */
    status: number;
    /**
     * Response message
     */
    message: string;
    payload: AuctionReport;
});

export type AdminAuctionReportError = (ErrorResponsePayload);

export type AdminForensicReportResponse = ({
    /**
     * Response HTTP status
     */
    status: number;
    /**
     * Response message
     */
    message: string;
    payload: ForensicReport;
});

export type AdminForensicReportError = (ErrorResponsePayload);

export type ItemCheckExpiredData = {
    path: {
        itemId: string;
    };
};

export type ItemCheckExpiredResponse = ({
    /**
     * Response HTTP status
     */
    status: number;
    /**
     * Response message
     */
    message: string;
    /**
     * Response Payload
     */
    payload: {
        /**
         * Expire status
         */
        isExpired: boolean;
    };
});

export type ItemCheckExpiredError = (ErrorResponsePayload);

export type UserFundResponse = ({
    /**
     * Response HTTP status
     */
    status: number;
    /**
     * Response message
     */
    message: string;
    payload: {
        /**
         * User fund
         */
        fund: number;
        /**
         * User email ID
         */
        userId: string;
        /**
         * User fund being hold for previous bids
         */
        fundsOnHold: number;
    };
});

export type UserFundError = (ErrorResponsePayload);
