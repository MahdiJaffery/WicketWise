export const validationCheck = (request, response, next) => {
    request.sessionStore.get(request.sessionID, (err, session) => {
        // console.log(session);
    })

    if (request.session.user)
        next();
    else
        return response.sendStatus(401);
}

export const parseId = (request, response, next) => {
    const { params: { id } } = request;
    const parsedId = parseInt(id);

    if (isNaN(parsedId)) return response.sendStatus(400);

    request.parsedId = parsedId;
    next();
}