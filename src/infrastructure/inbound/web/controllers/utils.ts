export const getUsernameFromReq = (req): string | null => {
    return req.user ? req.user.username : null;
};
