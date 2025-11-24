# from celery import Celery
# from celery.schedules import crontab
# from topk_hybrid_advanced import get_recommender

# # Create Celery app
# app = Celery('recommendation_system')
# app.conf.broker_url = 'redis://localhost:6379/0'

# @app.task
# def generate_nightly_recommendations():
#     """Run every night at 2 AM"""
#     print("Starting nightly recommendation generation...")
    
#     recommender = get_recommender()
#     stats = recommender.generate_all_users_hybrid(
#         strategy='weighted',
#         pkl_weight=0.6,
#         sbert_weight=0.4
#     )
    
#     print(f"Generated for {stats['successful']} users")
#     return stats

# # Schedule
# app.conf.beat_schedule = {
#     'nightly-recommendations': {
#         'task': 'generate_nightly_recommendations',
#         'schedule': crontab(hour=2, minute=0),  # 2:00 AM daily
#     },
# }

# if __name__ == '__main__':
#     app.start()


from celery import Celery
from celery.schedules import crontab
from topk_hybrid_advanced import get_recommender
import logging

logger = logging.getLogger(__name__)

# Create Celery app
app = Celery('recommendation_system')
app.conf.broker_url = 'redis://localhost:6379/0'
app.conf.result_backend = 'redis://localhost:6379/0'

@app.task
def generate_nightly_recommendations():
    """
    Run every night at 2:00 AM
    Generate recommendations for ALL users
    Pre-compute and cache them
    """
    logger.info("=" * 60)
    logger.info("STARTING NIGHTLY RECOMMENDATION GENERATION")
    logger.info("=" * 60)
    
    try:
        recommender = get_recommender()
        
        # Generate for all users
        stats = recommender.generate_all_users_hybrid(
            strategy='weighted',
            pkl_weight=0.6,
            sbert_weight=0.4
        )
        
        logger.info(f" Successfully generated for {stats['successful']} users")
        logger.info(f" Failed for {stats['failed']} users")
        
        return stats
        
    except Exception as e:
        logger.error(f"✗ Nightly generation failed: {e}")
        raise

# Schedule (runs at 2:00 AM daily)
app.conf.beat_schedule = {
    'nightly-recommendations': {
        'task': 'nightly_scheduler.generate_nightly_recommendations',
        'schedule': crontab(hour=2, minute=0),  # 2:00 AM
    },
}

if __name__ == '__main__':
    app.start()
