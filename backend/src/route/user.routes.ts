import { Router } from 'express'
import { getUsers, getUsersById,getCurrentUser,createUsers, updateUsers, deleteUsers} from '../controllers/user.controller'
import { vaildateMiddleware ,vaildateID} from '../middleware/validate.middleware'
import { createUserSchema, updateUserSchema, userIDParamsSchemea} from '../schema/user.schema'
import { authMiddleware } from '../middleware/auth.middleware'

const router = Router()

router.get('/' ,getUsers) // get all users
router.get('/me',authMiddleware, getCurrentUser)
router.get('/:id',vaildateID(userIDParamsSchemea), getUsersById) // get user by id
router.post('/',vaildateMiddleware(createUserSchema),createUsers)
router.put('/:id',vaildateID(userIDParamsSchemea),vaildateMiddleware(updateUserSchema), updateUsers) // update user by id
router.delete('/:id',vaildateID(userIDParamsSchemea), deleteUsers) // delete user by id



export default router