def calculate_product_risk(chemicals):
    total_weighted_score = 0
    total_weight = 0
    recognized = []

    endocrine_count = 0
    carcinogen_count = 0
    restricted_count = 0
    banned_count = 0

    for chemical in chemicals:
        # User requested weight = 1 in this step
        weight = 1

        # Base weighted score
        component_score = (chemical.risk_score or 0) * weight

        # Irritation contribution
        component_score += (chemical.irritation_index or 0) * 2

        # Endocrine disruption penalty
        if chemical.endocrine_disruptor:
            component_score += 15
            endocrine_count += 1

        # Carcinogenic penalty
        if chemical.carcinogenic_flag:
            component_score += 25
            carcinogen_count += 1

        # Regulatory penalty
        if chemical.regulatory_status == "Banned":
            component_score += 30
            banned_count += 1
        elif chemical.regulatory_status == "Restricted":
            component_score += 15
            restricted_count += 1

        total_weighted_score += component_score
        total_weight += weight

        recognized.append({
            "name": chemical.name,
            "base_risk_score": chemical.risk_score,
            "irritation_index": chemical.irritation_index,
            "endocrine_disruptor": chemical.endocrine_disruptor,
            "carcinogenic_flag": chemical.carcinogenic_flag,
            "regulatory_status": chemical.regulatory_status
        })

    overall_score = int(total_weighted_score / total_weight) if total_weight > 0 else 0

    if overall_score >= 85:
        category = "Critical"
    elif overall_score >= 70:
        category = "High"
    elif overall_score >= 40:
        category = "Moderate"
    else:
        category = "Low"

    reasoning = f"Risk classified as {category} due to "

    if banned_count > 0:
        reasoning += f"{banned_count} banned ingredient(s), "
    if restricted_count > 0:
        reasoning += f"{restricted_count} restricted ingredient(s), "
    if endocrine_count > 0:
        reasoning += f"{endocrine_count} endocrine disruptor(s), "
    if carcinogen_count > 0:
        reasoning += f"{carcinogen_count} carcinogenic ingredient(s), "

    reasoning += "and cumulative irritation contribution."

    return overall_score, category, recognized, reasoning
