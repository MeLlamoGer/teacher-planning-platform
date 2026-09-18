import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validateBody } from '../../middleware/validateBody';
import { createUserSchema, updateUserSchema, updatePasswordSchema } from './users.schemas';
import * as usersController from './users.controller';

const router = Router();

router.use(authenticate, authorize('DIRECTORA', 'SECRETARIA'));

router.get('/', usersController.getAll);
router.get('/:id', usersController.getById);
router.post('/', authorize('DIRECTORA'), validateBody(createUserSchema), usersController.create);
router.put('/:id', authorize('DIRECTORA'), validateBody(updateUserSchema), usersController.update);
router.put('/:id/password', authorize('DIRECTORA'), validateBody(updatePasswordSchema), usersController.updatePassword);
router.delete('/:id', authorize('DIRECTORA'), usersController.remove);

export default router;
