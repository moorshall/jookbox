import { apiSlice } from "../apiSlice";

export const extendedApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getAllPosts: builder.query<Post[], void>({
            query: () => "/post",
        }),
        getFollowerPosts: builder.query<Post[], string>({
            query: (id) => `/post/user/${id}/followers`,
        }),
        getUserPosts: builder.query<Post[], string>({
            query: (id) => `/post/user/${id}`,
        }),
        getPost: builder.query<Post, string>({
            query: (id) => `/post/${id}`,
        }),
    }),
});

export const {
    useGetAllPostsQuery,
    useGetFollowerPostsQuery,
    useGetUserPostsQuery,
    useGetPostQuery,
} = extendedApiSlice;