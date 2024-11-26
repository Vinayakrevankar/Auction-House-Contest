// This file is auto-generated by @hey-api/openapi-ts

export const UserInfoSchema = {
    type: 'object',
    properties: {
        username: {
            type: 'string',
            description: 'Username'
        },
        emailAddress: {
            type: 'string',
            format: 'email',
            description: 'User email'
        },
        userId: {
            type: 'string',
            description: 'User ID'
        },
        userType: {
            type: 'string',
            enum: ['seller', 'buyer'],
            description: 'User type, one of [seller, buyer]'
        },
        role: {
            type: 'string',
            enum: ['admin', 'user'],
            description: 'User role, one of [admin, user]'
        },
        token: {
            type: 'string',
            description: 'JWT token'
        }
    },
    required: ['username', 'emailAddress', 'userId', 'role', 'token', 'userType'],
    description: 'User info'
} as const;

export const ItemSchema = {
    type: 'object',
    properties: {
        id: {
            type: 'string',
            format: 'uuid',
            description: 'Item ID, in UUID'
        },
        name: {
            type: 'string',
            description: 'Item name'
        },
        description: {
            type: 'string',
            description: 'Item description'
        },
        initPrice: {
            type: 'number',
            description: 'Initial price, > $1'
        },
        startDate: {
            type: 'string',
            format: 'date-time',
            description: 'Auction start date time'
        },
        endDate: {
            type: 'string',
            format: 'date-time',
            description: 'Auction end date time'
        },
        lengthOfAuction: {
            type: 'integer',
            description: 'Auction length, in days'
        },
        itemState: {
            type: 'string',
            enum: ['active', 'archived', 'completed', 'failed', 'inactive'],
            description: 'Current state of item'
        },
        isFrozen: {
            type: 'boolean',
            description: 'Freeze status'
        },
        images: {
            type: 'array',
            items: {
                type: 'string',
                format: 'uuid'
            },
            description: 'S3 image keys'
        },
        currentBidId: {
            type: 'string',
            format: 'uuid',
            description: 'Current bid ID, in UUID'
        },
        pastBidIds: {
            type: 'array',
            items: {
                type: 'string',
                format: 'uuid',
                description: 'Bid ID, in UUID'
            },
            description: 'Historic bids'
        },
        soldBidId: {
            type: 'string',
            format: 'uuid',
            description: 'Item sold bid ID, in UUID'
        },
        sellerId: {
            type: 'string',
            description: 'Seller ID who posted the item'
        },
        createAt: {
            type: 'integer',
            format: 'int64',
            description: 'UNIX Timestamp'
        }
    },
    required: ['id', 'name', 'description', 'initPrice', 'lengthOfAuction', 'itemState', 'images', 'sellerId', 'startDate', 'endDate', 'createAt', 'isFrozen'],
    description: 'Item in auction'
} as const;

export const BidSchema = {
    type: 'object',
    properties: {
        id: {
            type: 'string',
            format: 'uuid',
            description: 'Bid ID, in UUID'
        },
        bidItemId: {
            type: 'string',
            format: 'uuid',
            description: 'Item ID of the bid, in UUID'
        },
        bidUserId: {
            type: 'string',
            description: 'Buyer ID who placed the bid'
        },
        bidAmount: {
            type: 'number',
            minimum: 1,
            description: 'Bid amount'
        },
        bidTime: {
            type: 'string',
            format: 'date-time',
            description: 'Bid time'
        },
        createAt: {
            type: 'integer',
            format: 'int64',
            description: 'UNIX Timestamp'
        },
        isActive: {
            type: 'boolean',
            description: 'Is this bid the active bid of the item'
        }
    },
    required: ['id', 'bidItemId', 'bidUserId', 'bidAmount', 'bidTime', 'createAt', 'isActive'],
    description: 'Bid to an item'
} as const;

export const PurchaseSchema = {
    type: 'object',
    properties: {
        itemId: {
            type: 'string',
            description: 'Item ID, in UUID',
            format: 'uuid'
        },
        itemName: {
            type: 'string',
            description: 'Item name'
        },
        price: {
            type: 'number',
            description: 'Purchased price'
        },
        soldTime: {
            type: 'string',
            description: 'Item sold time',
            format: 'date-time'
        },
        fulfillTime: {
            type: 'string',
            description: 'Purchase fulfilled time',
            format: 'date-time'
        }
    },
    description: 'Purchase Data',
    required: ['itemId', 'itemName', 'price', 'soldTime', 'fulfillTime']
} as const;

export const AuctionReportSchema = {
    type: 'object',
    properties: {
        totalCommissionEarned: {
            type: 'number',
            format: 'float'
        },
        totalSales: {
            type: 'number',
            format: 'float'
        },
        commissionRate: {
            type: 'number',
            format: 'float'
        },
        itemsSold: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    itemId: {
                        type: 'string'
                    },
                    salePrice: {
                        type: 'number'
                    },
                    commission: {
                        type: 'number'
                    }
                }
            }
        }
    }
} as const;

export const ForensicReportSchema = {
    type: 'object',
    properties: {
        reportId: {
            type: 'string',
            format: 'uuid'
        },
        url: {
            type: 'string',
            format: 'uri'
        }
    },
    required: ['reportId', 'url']
} as const;

export const ItemRequestPayloadSchema = {
    type: 'object',
    properties: {
        name: {
            type: 'string',
            description: 'Item name'
        },
        description: {
            type: 'string',
            description: 'Item description'
        },
        initPrice: {
            type: 'number',
            minimum: 1,
            description: 'Initial price of item, > $1'
        },
        lengthOfAuction: {
            type: 'integer',
            minimum: 1,
            description: 'Length of auction in days'
        },
        images: {
            type: 'array',
            items: {
                type: 'string',
                format: 'uuid',
                description: 'S3 object key'
            },
            description: 'S3 object keys for the images'
        }
    },
    required: ['name', 'description', 'initPrice', 'lengthOfAuction', 'images']
} as const;

export const ItemFulfillResponsePayloadSchema = {
    type: 'object',
    properties: {
        itemId: {
            type: 'string'
        },
        soldBid: {
            '$ref': '#/components/schemas/Bid'
        },
        soldTime: {
            type: 'string',
            format: 'date-time'
        }
    },
    required: ['itemId', 'soldBid', 'soldTime']
} as const;

export const AddFundsResponsePayloadSchema = {
    type: 'object',
    properties: {
        userId: {
            type: 'string',
            description: 'User ID of the target user'
        },
        funds: {
            type: 'string',
            description: 'Funds after operation'
        }
    },
    required: ['userId', 'funds']
} as const;

export const ErrorResponsePayloadSchema = {
    type: 'object',
    properties: {
        status: {
            type: 'integer'
        },
        errorCode: {
            type: 'string'
        },
        message: {
            type: 'string'
        }
    },
    required: ['status', 'message']
} as const;

export const PlainSuccessResponsePayloadSchema = {
    type: 'object',
    properties: {
        status: {
            type: 'integer',
            description: 'Response HTTP status'
        },
        message: {
            type: 'string',
            description: 'Response message'
        }
    },
    required: ['status', 'message']
} as const;