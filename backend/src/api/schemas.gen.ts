// This file is auto-generated by @hey-api/openapi-ts

export const SellerCreationRequestSchema = {
    type: 'object',
    required: ['username', 'emailAddress', 'password'],
    properties: {
        username: {
            type: 'string'
        },
        emailAddress: {
            type: 'string',
            format: 'email'
        },
        password: {
            type: 'string',
            format: 'password'
        }
    }
} as const;

export const OTPSchema = {
    type: 'object',
    required: ['emailAddress', 'OTP'],
    properties: {
        OTP: {
            type: 'string'
        },
        emailAddress: {
            type: 'string',
            format: 'email'
        }
    }
} as const;

export const SellerSchema = {
    type: 'object',
    properties: {
        id: {
            type: 'string'
        },
        username: {
            type: 'string'
        },
        emailAddress: {
            type: 'string',
            format: 'email'
        },
        fund: {
            type: 'number',
            format: 'float'
        },
        isFrozen: {
            type: 'boolean'
        },
        isClosed: {
            type: 'boolean'
        },
        itemIds: {
            type: 'array',
            items: {
                type: 'string'
            }
        },
        OTP: {
            type: 'string'
        }
    }
} as const;

export const LoginRequestSchema = {
    type: 'object',
    required: ['username', 'password'],
    properties: {
        username: {
            type: 'string'
        },
        password: {
            type: 'string',
            format: 'password'
        }
    }
} as const;

export const LoginResponseSchema = {
    type: 'object',
    properties: {
        token: {
            type: 'string'
        },
        sellerId: {
            type: 'string'
        },
        buyerId: {
            type: 'string'
        }
    }
} as const;

export const CloseAccountResponseSchema = {
    type: 'object',
    properties: {
        message: {
            type: 'string'
        },
        sellerId: {
            type: 'string'
        },
        buyerId: {
            type: 'string'
        },
        isClosed: {
            type: 'boolean'
        }
    }
} as const;

export const AddItemRequestSchema = {
    type: 'object',
    required: ['name', 'description', 'initPrice', 'lengthOfAuction', 'images'],
    properties: {
        name: {
            type: 'string'
        },
        description: {
            type: 'string'
        },
        initPrice: {
            type: 'number',
            minimum: 1
        },
        lengthOfAuction: {
            type: 'integer'
        },
        images: {
            type: 'array',
            items: {
                type: 'string',
                format: 'binary'
            }
        }
    }
} as const;

export const ItemSchema = {
    type: 'object',
    required: ['id', 'name', 'description', 'initPrice', 'startDate', 'endDate', 'itemState', 'isFrozen', 'images', 'sellerId'],
    properties: {
        id: {
            type: 'string'
        },
        name: {
            type: 'string'
        },
        description: {
            type: 'string'
        },
        initPrice: {
            type: 'number'
        },
        startDate: {
            type: 'string',
            format: 'date-time'
        },
        endDate: {
            type: 'string',
            format: 'date-time'
        },
        itemState: {
            type: 'string',
            enum: ['inactive', 'active', 'failed', 'completed', 'archived']
        },
        isFrozen: {
            type: 'boolean'
        },
        images: {
            type: 'array',
            items: {
                type: 'string',
                format: 'uri'
            }
        },
        currentBidId: {
            type: 'string'
        },
        pastBidIds: {
            type: 'array',
            items: {
                type: 'string'
            }
        },
        soldTime: {
            type: 'string',
            format: 'date-time'
        },
        soldBidId: {
            type: 'string'
        },
        sellerId: {
            type: 'string'
        }
    }
} as const;

export const ItemSummarySchema = {
    type: 'object',
    properties: {
        id: {
            type: 'string'
        },
        name: {
            type: 'string'
        },
        itemState: {
            type: 'string'
        },
        startDate: {
            type: 'string',
            format: 'date-time'
        },
        endDate: {
            type: 'string',
            format: 'date-time'
        },
        currentBid: {
            type: 'number'
        },
        soldTime: {
            type: 'string',
            format: 'date-time'
        }
    }
} as const;

export const EditItemRequestSchema = {
    type: 'object',
    properties: {
        name: {
            type: 'string'
        },
        description: {
            type: 'string'
        },
        initPrice: {
            type: 'number'
        },
        images: {
            type: 'array',
            items: {
                type: 'string',
                format: 'binary'
            }
        }
    }
} as const;

export const ActionResponseSchema = {
    type: 'object',
    properties: {
        message: {
            type: 'string'
        },
        itemId: {
            type: 'string'
        },
        sellerId: {
            type: 'string'
        },
        buyerId: {
            type: 'string'
        }
    }
} as const;

export const PublishItemRequestSchema = {
    type: 'object',
    properties: {
        startDate: {
            type: 'string',
            format: 'date-time'
        },
        endDate: {
            type: 'string',
            format: 'date-time'
        }
    }
} as const;

export const ItemPublishResponseSchema = {
    type: 'object',
    properties: {
        id: {
            type: 'string'
        },
        itemState: {
            type: 'string'
        },
        startDate: {
            type: 'string',
            format: 'date-time'
        },
        endDate: {
            type: 'string',
            format: 'date-time'
        }
    }
} as const;

export const ItemStateResponseSchema = {
    type: 'object',
    properties: {
        message: {
            type: 'string'
        },
        itemId: {
            type: 'string'
        },
        itemState: {
            type: 'string'
        }
    }
} as const;

export const FulfillItemResponseSchema = {
    type: 'object',
    properties: {
        message: {
            type: 'string'
        },
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
    }
} as const;

export const BuyerCreationRequestSchema = {
    type: 'object',
    required: ['username', 'emailAddress', 'password'],
    properties: {
        username: {
            type: 'string'
        },
        emailAddress: {
            type: 'string',
            format: 'email'
        },
        password: {
            type: 'string',
            format: 'password'
        }
    }
} as const;

export const BuyerSchema = {
    type: 'object',
    properties: {
        id: {
            type: 'string'
        },
        username: {
            type: 'string'
        },
        emailAddress: {
            type: 'string',
            format: 'email'
        },
        fund: {
            type: 'number',
            format: 'float'
        },
        isFrozen: {
            type: 'boolean'
        },
        isClosed: {
            type: 'boolean'
        },
        bidIds: {
            type: 'array',
            items: {
                type: 'string'
            }
        },
        purchases: {
            type: 'array',
            items: {
                '$ref': '#/components/schemas/Purchase'
            }
        },
        OTP: {
            type: 'string'
        }
    }
} as const;

export const AddFundsRequestSchema = {
    type: 'object',
    required: ['amount'],
    properties: {
        amount: {
            type: 'number',
            format: 'float',
            minimum: 0
        }
    }
} as const;

export const AddFundsResponseSchema = {
    type: 'object',
    properties: {
        message: {
            type: 'string'
        },
        buyerId: {
            type: 'string'
        },
        fund: {
            type: 'number',
            format: 'float'
        }
    }
} as const;

export const ActiveBidSchema = {
    type: 'object',
    properties: {
        itemId: {
            type: 'string'
        },
        itemName: {
            type: 'string'
        },
        currentBid: {
            type: 'number'
        },
        yourBid: {
            type: 'number'
        },
        bidTime: {
            type: 'string',
            format: 'date-time'
        },
        endDate: {
            type: 'string',
            format: 'date-time'
        }
    }
} as const;

export const PurchaseSchema = {
    type: 'object',
    properties: {
        itemId: {
            type: 'string'
        },
        itemName: {
            type: 'string'
        },
        purchasePrice: {
            type: 'number'
        },
        soldTime: {
            type: 'string',
            format: 'date-time'
        },
        fulfillmentDate: {
            type: 'string',
            format: 'date-time'
        }
    }
} as const;

export const PlaceBidRequestSchema = {
    type: 'object',
    required: ['itemId', 'bidAmount'],
    properties: {
        itemId: {
            type: 'string'
        },
        bidAmount: {
            type: 'number'
        }
    }
} as const;

export const BidResponseSchema = {
    type: 'object',
    properties: {
        message: {
            type: 'string'
        },
        bid: {
            '$ref': '#/components/schemas/Bid'
        }
    }
} as const;

export const BidSchema = {
    type: 'object',
    properties: {
        bidUserId: {
            type: 'string'
        },
        bidAmount: {
            type: 'number'
        },
        bidTime: {
            type: 'string',
            format: 'date-time'
        }
    }
} as const;

export const ItemDetailsSchema = {
    type: 'object',
    properties: {
        id: {
            type: 'string'
        },
        name: {
            type: 'string'
        },
        description: {
            type: 'string'
        },
        images: {
            type: 'array',
            items: {
                type: 'string',
                format: 'uri'
            }
        },
        price: {
            type: 'number'
        },
        startDate: {
            type: 'string',
            format: 'date-time'
        },
        endDate: {
            type: 'string',
            format: 'date-time'
        },
        highestBid: {
            type: 'number'
        },
        biddingHistory: {
            type: 'array',
            items: {
                '$ref': '#/components/schemas/Bid'
            }
        }
    }
} as const;

export const RecentlySoldItemSchema = {
    type: 'object',
    properties: {
        id: {
            type: 'string'
        },
        name: {
            type: 'string'
        },
        price: {
            type: 'number'
        },
        soldTime: {
            type: 'string',
            format: 'date-time'
        },
        biddingHistory: {
            type: 'array',
            items: {
                '$ref': '#/components/schemas/Bid'
            }
        }
    }
} as const;

export const FreezeActionRequestSchema = {
    type: 'object',
    required: ['action'],
    properties: {
        action: {
            type: 'string',
            enum: ['freeze', 'unfreeze']
        }
    }
} as const;

export const FreezeActionResponseSchema = {
    type: 'object',
    properties: {
        message: {
            type: 'string'
        },
        sellerId: {
            type: 'string'
        },
        buyerId: {
            type: 'string'
        },
        itemId: {
            type: 'string'
        },
        isFrozen: {
            type: 'boolean'
        }
    }
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

export const ForensicsReportSchema = {
    type: 'object',
    properties: {
        reportId: {
            type: 'string'
        },
        url: {
            type: 'string',
            format: 'uri'
        }
    }
} as const;