// This file is auto-generated by @hey-api/openapi-ts

import { createClient, createConfig, type Options } from '@hey-api/client-fetch';
import type { PostApiSellersData, PostApiSellersError, PostApiSellersResponse, PostApiVerifyData, PostApiVerifyError, PostApiVerifyResponse, PostApiSellersLoginData, PostApiSellersLoginError, PostApiSellersLoginResponse, PostApiSellersBySellerIdCloseData, PostApiSellersBySellerIdCloseError, PostApiSellersBySellerIdCloseResponse, PostApiSellersBySellerIdItemsData, PostApiSellersBySellerIdItemsError, PostApiSellersBySellerIdItemsResponse, GetApiSellersBySellerIdItemsData, GetApiSellersBySellerIdItemsError, GetApiSellersBySellerIdItemsResponse, PutApiSellersBySellerIdItemsByItemIdData, PutApiSellersBySellerIdItemsByItemIdError, PutApiSellersBySellerIdItemsByItemIdResponse, DeleteApiSellersBySellerIdItemsByItemIdData, DeleteApiSellersBySellerIdItemsByItemIdError, DeleteApiSellersBySellerIdItemsByItemIdResponse, PostApiSellersBySellerIdItemsByItemIdPublishData, PostApiSellersBySellerIdItemsByItemIdPublishError, PostApiSellersBySellerIdItemsByItemIdPublishResponse, PostApiSellersBySellerIdItemsByItemIdUnpublishData, PostApiSellersBySellerIdItemsByItemIdUnpublishError, PostApiSellersBySellerIdItemsByItemIdUnpublishResponse, PostApiSellersBySellerIdItemsByItemIdFulfillData, PostApiSellersBySellerIdItemsByItemIdFulfillError, PostApiSellersBySellerIdItemsByItemIdFulfillResponse, PostApiSellersBySellerIdItemsByItemIdArchiveData, PostApiSellersBySellerIdItemsByItemIdArchiveError, PostApiSellersBySellerIdItemsByItemIdArchiveResponse, PostApiSellersBySellerIdRequestUnfreezeData, PostApiSellersBySellerIdRequestUnfreezeError, PostApiSellersBySellerIdRequestUnfreezeResponse, PostApiSellersBySellerIdItemsByItemIdRequestUnfreezeData, PostApiSellersBySellerIdItemsByItemIdRequestUnfreezeError, PostApiSellersBySellerIdItemsByItemIdRequestUnfreezeResponse, PostApiBuyersData, PostApiBuyersError, PostApiBuyersResponse, PostApiBuyersLoginData, PostApiBuyersLoginError, PostApiBuyersLoginResponse, PostApiBuyersByBuyerIdCloseData, PostApiBuyersByBuyerIdCloseError, PostApiBuyersByBuyerIdCloseResponse, PostApiBuyersByBuyerIdAddFundsData, PostApiBuyersByBuyerIdAddFundsError, PostApiBuyersByBuyerIdAddFundsResponse, GetApiBuyersByBuyerIdActiveBidsData, GetApiBuyersByBuyerIdActiveBidsError, GetApiBuyersByBuyerIdActiveBidsResponse, GetApiBuyersByBuyerIdPurchasesData, GetApiBuyersByBuyerIdPurchasesError, GetApiBuyersByBuyerIdPurchasesResponse, PostApiBuyersByBuyerIdRequestUnfreezeData, PostApiBuyersByBuyerIdRequestUnfreezeError, PostApiBuyersByBuyerIdRequestUnfreezeResponse, PostApiBuyersByBuyerIdBidsData, PostApiBuyersByBuyerIdBidsError, PostApiBuyersByBuyerIdBidsResponse, GetApiItemsData, GetApiItemsError, GetApiItemsResponse, GetApiItemsByItemIdData, GetApiItemsByItemIdError, GetApiItemsByItemIdResponse, GetApiItemsRecentlySoldData, GetApiItemsRecentlySoldError, GetApiItemsRecentlySoldResponse, PostApiAdminBuyersByBuyerIdFreezeData, PostApiAdminBuyersByBuyerIdFreezeError, PostApiAdminBuyersByBuyerIdFreezeResponse, PostApiAdminSellersBySellerIdFreezeData, PostApiAdminSellersBySellerIdFreezeError, PostApiAdminSellersBySellerIdFreezeResponse, PostApiAdminItemsByItemIdFreezeData, PostApiAdminItemsByItemIdFreezeError, PostApiAdminItemsByItemIdFreezeResponse, GetApiAdminReportsAuctionError, GetApiAdminReportsAuctionResponse, GetApiAdminReportsForensicsError, GetApiAdminReportsForensicsResponse } from './types.gen';

export const client = createClient(createConfig());

/**
 * Create a seller account
 */
export const postApiSellers = <ThrowOnError extends boolean = false>(options: Options<PostApiSellersData, ThrowOnError>) => {
    return (options?.client ?? client).post<PostApiSellersResponse, PostApiSellersError, ThrowOnError>({
        ...options,
        url: '/api/sellers'
    });
};

/**
 * Create a seller account
 */
export const postApiVerify = <ThrowOnError extends boolean = false>(options: Options<PostApiVerifyData, ThrowOnError>) => {
    return (options?.client ?? client).post<PostApiVerifyResponse, PostApiVerifyError, ThrowOnError>({
        ...options,
        url: '/api/verify'
    });
};

/**
 * Seller login
 */
export const postApiSellersLogin = <ThrowOnError extends boolean = false>(options: Options<PostApiSellersLoginData, ThrowOnError>) => {
    return (options?.client ?? client).post<PostApiSellersLoginResponse, PostApiSellersLoginError, ThrowOnError>({
        ...options,
        url: '/api/sellers/login'
    });
};

/**
 * Close seller account
 */
export const postApiSellersBySellerIdClose = <ThrowOnError extends boolean = false>(options: Options<PostApiSellersBySellerIdCloseData, ThrowOnError>) => {
    return (options?.client ?? client).post<PostApiSellersBySellerIdCloseResponse, PostApiSellersBySellerIdCloseError, ThrowOnError>({
        ...options,
        url: '/api/sellers/{sellerId}/close'
    });
};

/**
 * Add an item for sale
 */
export const postApiSellersBySellerIdItems = <ThrowOnError extends boolean = false>(options: Options<PostApiSellersBySellerIdItemsData, ThrowOnError>) => {
    return (options?.client ?? client).post<PostApiSellersBySellerIdItemsResponse, PostApiSellersBySellerIdItemsError, ThrowOnError>({
        ...options,
        url: '/api/sellers/{sellerId}/items'
    });
};

/**
 * Review seller's items
 */
export const getApiSellersBySellerIdItems = <ThrowOnError extends boolean = false>(options: Options<GetApiSellersBySellerIdItemsData, ThrowOnError>) => {
    return (options?.client ?? client).get<GetApiSellersBySellerIdItemsResponse, GetApiSellersBySellerIdItemsError, ThrowOnError>({
        ...options,
        url: '/api/sellers/{sellerId}/items'
    });
};

/**
 * Edit an inactive item
 */
export const putApiSellersBySellerIdItemsByItemId = <ThrowOnError extends boolean = false>(options: Options<PutApiSellersBySellerIdItemsByItemIdData, ThrowOnError>) => {
    return (options?.client ?? client).put<PutApiSellersBySellerIdItemsByItemIdResponse, PutApiSellersBySellerIdItemsByItemIdError, ThrowOnError>({
        ...options,
        url: '/api/sellers/{sellerId}/items/{itemId}'
    });
};

/**
 * Remove an inactive item
 */
export const deleteApiSellersBySellerIdItemsByItemId = <ThrowOnError extends boolean = false>(options: Options<DeleteApiSellersBySellerIdItemsByItemIdData, ThrowOnError>) => {
    return (options?.client ?? client).delete<DeleteApiSellersBySellerIdItemsByItemIdResponse, DeleteApiSellersBySellerIdItemsByItemIdError, ThrowOnError>({
        ...options,
        url: '/api/sellers/{sellerId}/items/{itemId}'
    });
};

/**
 * Publish an item
 */
export const postApiSellersBySellerIdItemsByItemIdPublish = <ThrowOnError extends boolean = false>(options: Options<PostApiSellersBySellerIdItemsByItemIdPublishData, ThrowOnError>) => {
    return (options?.client ?? client).post<PostApiSellersBySellerIdItemsByItemIdPublishResponse, PostApiSellersBySellerIdItemsByItemIdPublishError, ThrowOnError>({
        ...options,
        url: '/api/sellers/{sellerId}/items/{itemId}/publish'
    });
};

/**
 * Unpublish an active item with no bids
 */
export const postApiSellersBySellerIdItemsByItemIdUnpublish = <ThrowOnError extends boolean = false>(options: Options<PostApiSellersBySellerIdItemsByItemIdUnpublishData, ThrowOnError>) => {
    return (options?.client ?? client).post<PostApiSellersBySellerIdItemsByItemIdUnpublishResponse, PostApiSellersBySellerIdItemsByItemIdUnpublishError, ThrowOnError>({
        ...options,
        url: '/api/sellers/{sellerId}/items/{itemId}/unpublish'
    });
};

/**
 * Fulfill a completed auction item
 */
export const postApiSellersBySellerIdItemsByItemIdFulfill = <ThrowOnError extends boolean = false>(options: Options<PostApiSellersBySellerIdItemsByItemIdFulfillData, ThrowOnError>) => {
    return (options?.client ?? client).post<PostApiSellersBySellerIdItemsByItemIdFulfillResponse, PostApiSellersBySellerIdItemsByItemIdFulfillError, ThrowOnError>({
        ...options,
        url: '/api/sellers/{sellerId}/items/{itemId}/fulfill'
    });
};

/**
 * Archive an inactive item
 */
export const postApiSellersBySellerIdItemsByItemIdArchive = <ThrowOnError extends boolean = false>(options: Options<PostApiSellersBySellerIdItemsByItemIdArchiveData, ThrowOnError>) => {
    return (options?.client ?? client).post<PostApiSellersBySellerIdItemsByItemIdArchiveResponse, PostApiSellersBySellerIdItemsByItemIdArchiveError, ThrowOnError>({
        ...options,
        url: '/api/sellers/{sellerId}/items/{itemId}/archive'
    });
};

/**
 * Request to unfreeze seller account
 */
export const postApiSellersBySellerIdRequestUnfreeze = <ThrowOnError extends boolean = false>(options: Options<PostApiSellersBySellerIdRequestUnfreezeData, ThrowOnError>) => {
    return (options?.client ?? client).post<PostApiSellersBySellerIdRequestUnfreezeResponse, PostApiSellersBySellerIdRequestUnfreezeError, ThrowOnError>({
        ...options,
        url: '/api/sellers/{sellerId}/request-unfreeze'
    });
};

/**
 * Request to unfreeze an item
 */
export const postApiSellersBySellerIdItemsByItemIdRequestUnfreeze = <ThrowOnError extends boolean = false>(options: Options<PostApiSellersBySellerIdItemsByItemIdRequestUnfreezeData, ThrowOnError>) => {
    return (options?.client ?? client).post<PostApiSellersBySellerIdItemsByItemIdRequestUnfreezeResponse, PostApiSellersBySellerIdItemsByItemIdRequestUnfreezeError, ThrowOnError>({
        ...options,
        url: '/api/sellers/{sellerId}/items/{itemId}/request-unfreeze'
    });
};

/**
 * Create a buyer account
 */
export const postApiBuyers = <ThrowOnError extends boolean = false>(options: Options<PostApiBuyersData, ThrowOnError>) => {
    return (options?.client ?? client).post<PostApiBuyersResponse, PostApiBuyersError, ThrowOnError>({
        ...options,
        url: '/api/buyers'
    });
};

/**
 * Buyer login
 */
export const postApiBuyersLogin = <ThrowOnError extends boolean = false>(options: Options<PostApiBuyersLoginData, ThrowOnError>) => {
    return (options?.client ?? client).post<PostApiBuyersLoginResponse, PostApiBuyersLoginError, ThrowOnError>({
        ...options,
        url: '/api/buyers/login'
    });
};

/**
 * Close buyer account
 */
export const postApiBuyersByBuyerIdClose = <ThrowOnError extends boolean = false>(options: Options<PostApiBuyersByBuyerIdCloseData, ThrowOnError>) => {
    return (options?.client ?? client).post<PostApiBuyersByBuyerIdCloseResponse, PostApiBuyersByBuyerIdCloseError, ThrowOnError>({
        ...options,
        url: '/api/buyers/{buyerId}/close'
    });
};

/**
 * Add funds to buyer account
 */
export const postApiBuyersByBuyerIdAddFunds = <ThrowOnError extends boolean = false>(options: Options<PostApiBuyersByBuyerIdAddFundsData, ThrowOnError>) => {
    return (options?.client ?? client).post<PostApiBuyersByBuyerIdAddFundsResponse, PostApiBuyersByBuyerIdAddFundsError, ThrowOnError>({
        ...options,
        url: '/api/buyers/{buyerId}/add-funds'
    });
};

/**
 * Review buyer's active bids
 */
export const getApiBuyersByBuyerIdActiveBids = <ThrowOnError extends boolean = false>(options: Options<GetApiBuyersByBuyerIdActiveBidsData, ThrowOnError>) => {
    return (options?.client ?? client).get<GetApiBuyersByBuyerIdActiveBidsResponse, GetApiBuyersByBuyerIdActiveBidsError, ThrowOnError>({
        ...options,
        url: '/api/buyers/{buyerId}/active-bids'
    });
};

/**
 * Review buyer's purchases
 */
export const getApiBuyersByBuyerIdPurchases = <ThrowOnError extends boolean = false>(options: Options<GetApiBuyersByBuyerIdPurchasesData, ThrowOnError>) => {
    return (options?.client ?? client).get<GetApiBuyersByBuyerIdPurchasesResponse, GetApiBuyersByBuyerIdPurchasesError, ThrowOnError>({
        ...options,
        url: '/api/buyers/{buyerId}/purchases'
    });
};

/**
 * Request to unfreeze buyer account
 */
export const postApiBuyersByBuyerIdRequestUnfreeze = <ThrowOnError extends boolean = false>(options: Options<PostApiBuyersByBuyerIdRequestUnfreezeData, ThrowOnError>) => {
    return (options?.client ?? client).post<PostApiBuyersByBuyerIdRequestUnfreezeResponse, PostApiBuyersByBuyerIdRequestUnfreezeError, ThrowOnError>({
        ...options,
        url: '/api/buyers/{buyerId}/request-unfreeze'
    });
};

/**
 * Place a bid on an item
 */
export const postApiBuyersByBuyerIdBids = <ThrowOnError extends boolean = false>(options: Options<PostApiBuyersByBuyerIdBidsData, ThrowOnError>) => {
    return (options?.client ?? client).post<PostApiBuyersByBuyerIdBidsResponse, PostApiBuyersByBuyerIdBidsError, ThrowOnError>({
        ...options,
        url: '/api/buyers/{buyerId}/bids'
    });
};

/**
 * Search and sort active items
 */
export const getApiItems = <ThrowOnError extends boolean = false>(options?: Options<GetApiItemsData, ThrowOnError>) => {
    return (options?.client ?? client).get<GetApiItemsResponse, GetApiItemsError, ThrowOnError>({
        ...options,
        url: '/api/items'
    });
};

/**
 * View item details
 */
export const getApiItemsByItemId = <ThrowOnError extends boolean = false>(options: Options<GetApiItemsByItemIdData, ThrowOnError>) => {
    return (options?.client ?? client).get<GetApiItemsByItemIdResponse, GetApiItemsByItemIdError, ThrowOnError>({
        ...options,
        url: '/api/items/{itemId}'
    });
};

/**
 * Search and sort recently sold items
 */
export const getApiItemsRecentlySold = <ThrowOnError extends boolean = false>(options?: Options<GetApiItemsRecentlySoldData, ThrowOnError>) => {
    return (options?.client ?? client).get<GetApiItemsRecentlySoldResponse, GetApiItemsRecentlySoldError, ThrowOnError>({
        ...options,
        url: '/api/items/recently-sold'
    });
};

/**
 * Freeze or unfreeze a buyer account
 */
export const postApiAdminBuyersByBuyerIdFreeze = <ThrowOnError extends boolean = false>(options: Options<PostApiAdminBuyersByBuyerIdFreezeData, ThrowOnError>) => {
    return (options?.client ?? client).post<PostApiAdminBuyersByBuyerIdFreezeResponse, PostApiAdminBuyersByBuyerIdFreezeError, ThrowOnError>({
        ...options,
        url: '/api/admin/buyers/{buyerId}/freeze'
    });
};

/**
 * Freeze or unfreeze a seller account
 */
export const postApiAdminSellersBySellerIdFreeze = <ThrowOnError extends boolean = false>(options: Options<PostApiAdminSellersBySellerIdFreezeData, ThrowOnError>) => {
    return (options?.client ?? client).post<PostApiAdminSellersBySellerIdFreezeResponse, PostApiAdminSellersBySellerIdFreezeError, ThrowOnError>({
        ...options,
        url: '/api/admin/sellers/{sellerId}/freeze'
    });
};

/**
 * Freeze or unfreeze an item
 */
export const postApiAdminItemsByItemIdFreeze = <ThrowOnError extends boolean = false>(options: Options<PostApiAdminItemsByItemIdFreezeData, ThrowOnError>) => {
    return (options?.client ?? client).post<PostApiAdminItemsByItemIdFreezeResponse, PostApiAdminItemsByItemIdFreezeError, ThrowOnError>({
        ...options,
        url: '/api/admin/items/{itemId}/freeze'
    });
};

/**
 * Generate auction report
 */
export const getApiAdminReportsAuction = <ThrowOnError extends boolean = false>(options?: Options<unknown, ThrowOnError>) => {
    return (options?.client ?? client).get<GetApiAdminReportsAuctionResponse, GetApiAdminReportsAuctionError, ThrowOnError>({
        ...options,
        url: '/api/admin/reports/auction'
    });
};

/**
 * Generate forensics report
 */
export const getApiAdminReportsForensics = <ThrowOnError extends boolean = false>(options?: Options<unknown, ThrowOnError>) => {
    return (options?.client ?? client).get<GetApiAdminReportsForensicsResponse, GetApiAdminReportsForensicsError, ThrowOnError>({
        ...options,
        url: '/api/admin/reports/forensics'
    });
};