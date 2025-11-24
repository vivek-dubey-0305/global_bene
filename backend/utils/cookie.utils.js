const cookieToken = async (user, res) => {

    const accessToken = await user.generateAccessToken()
    const refreshToken = await user.generateRefreshToken()

    user.refreshToken = refreshToken;

    return res.status(201)
        .json({
            success: true,
            message: `User created`,
            user, accessToken, refreshToken
        })
}

export { cookieToken }
