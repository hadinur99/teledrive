import { Request, Response } from 'express'
import { Users } from '../../model/entities/Users'
import { PayPal } from '../../service/PayPal'
import { Endpoint } from '../base/Endpoint'
import { Auth } from '../middlewares/Auth'

@Endpoint.API()
export class Subscriptions {

  @Endpoint.POST('/', { middlewares: [Auth] })
  public async create(req: Request, res: Response): Promise<any> {
    if (req.user.subscription_id) {
      try {
        const result = await new PayPal().getSubscription(req.user.subscription_id)
        const link = result.links.find(link => link.rel === 'approve')?.href
        return res.send({ link: link || '/dashboard' })
      } catch (error) {
        // ignore
      }
    }

    const result = await new PayPal().createSubscription(req.user)
    await Users.update(req.user.id, { subscription_id: result.id })
    return res.send({ link: result.links.find(link => link.rel === 'approve').href })
  }
}