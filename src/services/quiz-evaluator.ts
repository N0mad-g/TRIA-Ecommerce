import type { QuizAnswers, Protocol } from '@/types'

type ClinicalStage = 'pre-op' | 'post-op-recent' | 'post-op-consolidated' | 'active-loss' | 'maintenance'
type Focus = 'beard' | 'hair' | 'both'

export class QuizEvaluator {
  evaluateRecommendation(
    answers: QuizAnswers,
    protocols: Record<string, Protocol>
  ): string {
    const clinicalStage = answers.clinical_stage as ClinicalStage
    const focus = answers.focus as Focus

    if (focus === 'beard') {
      return protocols['define']?.id || ''
    }

    if ((focus === 'hair' || focus === 'both') &&
        (clinicalStage === 'post-op-recent' || clinicalStage === 'active-loss')) {
      return protocols['reconstruct']?.id || ''
    }

    if (focus === 'hair' &&
        (clinicalStage === 'pre-op' || clinicalStage === 'post-op-consolidated' || clinicalStage === 'maintenance')) {
      return protocols['origin']?.id || ''
    }

    if (focus === 'both' &&
        (clinicalStage === 'pre-op' || clinicalStage === 'post-op-consolidated' || clinicalStage === 'maintenance')) {
      return protocols['complete']?.id || ''
    }

    return protocols['origin']?.id || ''
  }

  getRecommendationNarrative(protocolName: string): string {
    const narratives: Record<string, string> = {
      'Origin': 'Comece sua jornada com o protocolo Origin, formulado para estágios iniciais de reconstrução.',
      'Reconstruct': 'Protocolo Reconstruct: especializado para recuperação ativa pós-operatória.',
      'Define': 'Protocolo Define: soluções premium para barba impecável.',
      'Complete': 'Protocolo Complete: a solução mais abrangente para cabelo e barba.',
    }

    return narratives[protocolName] || 'Protocolo recomendado para você.'
  }
}

export const quizEvaluator = new QuizEvaluator()
