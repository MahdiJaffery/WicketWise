export const validationCheck = (request, response, next) => {
    request.sessionStore.get(request.sessionID, (err, session) => {
        // console.log(session);
    })
}