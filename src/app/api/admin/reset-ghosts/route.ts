import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { getSession } from '../../../../lib/auth';

/**
 * POST /api/admin/reset-ghosts
 * 
 * Finds every Website whose status is SOLD or HIDDEN but has NO
 * active order (PAID / PROCESSING / COMPLETED) and resets it back
 * to APPROVED so it reappears in the Marketplace.
 *
 * Also cleans up orphaned PENDING orders (payment was started but
 * never verified) so they don't pollute the Buyer dashboard.
 */
export async function POST() {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Admin only.' }, { status: 403 });
    }

    // 1. Find ghost websites — marked SOLD/HIDDEN but with no real paid order
    const ghostSites = await prisma.website.findMany({
      where: {
        status: { in: ['SOLD', 'HIDDEN'] },
        orders: {
          none: {
            status: { in: ['PAID', 'PROCESSING', 'COMPLETED'] }
          }
        }
      }
    });

    // 2. Reset them to APPROVED
    const resetResult = await prisma.website.updateMany({
      where: {
        id: { in: ghostSites.map((s: any) => s.id) }
      },
      data: { status: 'APPROVED' }
    });

    // 3. Delete orphaned PENDING orders (payment never completed)
    const orphanedOrders = await prisma.order.deleteMany({
      where: {
        status: 'PENDING'
      }
    });

    return NextResponse.json({
      success: true,
      ghostSitesFixed: resetResult.count,
      ghostSiteUrls: ghostSites.map((s: any) => s.url),
      orphanedOrdersDeleted: orphanedOrders.count
    }, { status: 200 });
  } catch (error) {
    console.error('Ghost reset error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
